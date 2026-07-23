import { button, div, divider, hyperlink, makeComponent, renderRoot, span } from "./jsgui.mjs";

// html elements
const Input = makeComponent("input", function() {
  this.useNode(() => document.createElement("input"));
});
const Select = makeComponent("select", function() {
  this.useNode(() => document.createElement("select"));
});
const Option = makeComponent("option", function(value, label, props) {
  const z = this.useNode(() => document.createElement("option"));
  if (label != null) {
    z.value = value
    z.innerText = label;
  } else {
    z.innerText = value;
  }
});
const Hr = makeComponent("hr", function() {
  this.useNode(() => document.createElement("hr"));
});

// qiss elements
const Column = makeComponent("column", function() {
  this.useNode(() => document.createElement("column"));
});
const Row = makeComponent("row", function() {
  this.useNode(() => document.createElement("row"));
});
const ColumnSplit = makeComponent("column-split", function() {
  this.useNode(() => document.createElement("column-split"));
});
const RowSplit = makeComponent("row-split", function() {
  this.useNode(() => document.createElement("row-split"));
});
const ColumnWrap = makeComponent("column-wrap", function() {
  this.useNode(() => document.createElement("column-wrap"));
});
const RowWrap = makeComponent("row-wrap", function() {
  this.useNode(() => document.createElement("row-wrap"));
});

// google icons (https://fonts.google.com/icons)
const Icon = makeComponent("icon", function (type="", props) {
  const node = this.useNode(() => document.createElement("span"))
  this.baseProps.className = ["material-symbols-outlined", ...(props?.className ?? [])];
  node.innerText = type;
});
const IconButton = makeComponent("icon-button", function (type, props={}) {
  const {disabled, onClick, ...extra} = props;
  this.append(Icon(type, {
    ...extra,
    attribute: {...extra.attribute, dataDisabled: disabled},
    events: {click: (event) => !disabled && onClick(event), ...extra.events},
  }));
});

// query utils
function getQuery() {
  const query = window.location.search.slice(1);
  const entries = query.split("&").map((v) => {
    const i = v.indexOf("=");
    if (i === -1) return [decodeURI(v), ""];
    return [decodeURI(v.slice(0, i)), decodeURI(v.slice(i + 1))];
  })
  return Object.fromEntries(entries);
}
function setQuery(newQuery) {
  const {origin, pathname} = window.location;
  const currentUrl = origin + pathname;
  const entries = Object.entries(newQuery).map(([k, v]) => {
    return `${encodeURI(k)}=${encodeURI(v)}`;
  });
  const newUrl = entries.length ? `${currentUrl}?${entries.join("&")}` : currentUrl;
  window.history.replaceState(null, "", newUrl);
}

// app
const FilterType = {
  First20TagsInclude: "I20",
  First20TagsExclude: "E20",
  First5TagsInclude: "I5",
  First5TagsExclude: "E5",
  FuzzyInclude: "FI",
  FuzzyExclude: "FE",
  Fuzzy5Include: "FI5",
  Fuzzy5Exclude: "FE5",
  RatingGTE: "RG",
  RatingLTE: "RL",
  NameInclude: "NI",
  NameExclude: "NE",
};
function getFilterGroup(filterType) {
  switch (filterType) {
  case FilterType.FuzzyInclude:
  case FilterType.FuzzyExclude:
  case FilterType.Fuzzy5Include:
  case FilterType.Fuzzy5Exclude:
  case FilterType.NameInclude:
  case FilterType.NameExclude: {
    return "text";
  } break;
  case FilterType.RatingGTE:
  case FilterType.RatingLTE: {
    return "rating";
  } break;
  default: {
    return "tag";
  } break;
  }
}
const t = {
  [FilterType.First20TagsInclude]: "First 20 tags include",
  [FilterType.First20TagsExclude]: "First 20 tags exclude",
  [FilterType.First5TagsInclude]: "First 5 tags include",
  [FilterType.First5TagsExclude]: "First 5 tags exclude",
  [FilterType.FuzzyInclude]: "Fuzzy 20 include",
  [FilterType.FuzzyExclude]: "Fuzzy 20 exclude",
  [FilterType.Fuzzy5Include]: "Fuzzy 5 include",
  [FilterType.Fuzzy5Exclude]: "Fuzzy 5 exclude",
  [FilterType.RatingGTE]: "Rating% >=",
  [FilterType.RatingLTE]: "Rating% <=",
  [FilterType.NameInclude]: "Name includes",
  [FilterType.NameExclude]: "Name excludes",
};
const FILTER_INPUT_STYLES = {width: 146};
const FILTER_SELECT_STYLES = {...FILTER_INPUT_STYLES, paddingRight: 16}
const Filter = makeComponent("filter", function(props) {
  const {state, changeState, i, j} = props;
  const selectedFilter = state.filters[i][j] ?? {
    type: FilterType.First20TagsInclude,
    value: "",
  };
  const selectedFilterGroup = getFilterGroup(selectedFilter.type);
  const setSelectedFilter = (diff) => {
    const newFilters = [...state.filters];
    
    const newOrFilters = [...state.filters[i]];
    const newFilter = {...selectedFilter, ...diff};
    newOrFilters.splice(j, 1, newFilter);

    newFilters.splice(i, 1, newOrFilters);
    changeState({filters: newFilters, pageIndex: 0});
  }
  const column = this.append(Column());
  // filter type
  const filterTypeSelect = column.append(Select({
    style: FILTER_SELECT_STYLES,
    events: {input: (event) => setSelectedFilter({type: event.target.value})},
  }));
  for (const filterType of Object.values(FilterType)) {
    filterTypeSelect.append(Option(filterType, t[filterType]));
  }
  // filter value
  let filterValueInput;
  switch (selectedFilterGroup) {
  case "rating": {
    filterValueInput = column.append(Input({
      style: FILTER_INPUT_STYLES,
      attribute: {name: selectedFilterGroup, type: "number", min: 0, max: 100, step: 1},
      events: {input: (event) => setSelectedFilter({value: event.target.value})},
    }));
  } break;
  case "text": {
    filterValueInput = column.append(Input({
      style: FILTER_INPUT_STYLES,
      attribute: {name: selectedFilterGroup},
      events: {input: (event) => setSelectedFilter({value: event.target.value})},
    }))
  } break;
  default: {
    filterValueInput = column.append(Select({
      style: FILTER_SELECT_STYLES,
      attribute: {name: selectedFilterGroup},
      events: {input: (event) => setSelectedFilter({value: event.target.value})},
    }));
    filterValueInput.append(Option(""));
    for (const tag of state.allTags) {
      filterValueInput.append(Option(tag));
    }
  } break;
  }
  return {
    onMount: () => {
      filterTypeSelect.node.value = selectedFilter.type;
      filterValueInput.node.value = selectedFilter.value;
    }
  }
});
const FilterButtons = makeComponent("filter-buttons", function (props) {
  const {onAdd, onRemove} = props;
  const buttons = this.append(Row());
  buttons.append(button("-", {
    style: {width: 30, height: 30},
    events: {click: onRemove},
  }));
  buttons.append(button("+", {
    style: {width: 30, height: 30},
    events: {click: onAdd},
  }));
});
const Filters = makeComponent("filters", function(props) {
  const {state, changeState} = props;
  const column = this.append(Column({style: {gap: 8}}));
  // existing filters
  for (let i = 0; i < state.filters.length; i++) {
    const row = column.append(RowWrap({style: {gap: 8}}));
    row.append(span("and", {style: i === 0 ? {visibility: "hidden"} : {}}));
    const orFilters = state.filters[i];
    for (let j = 0; j < orFilters.length; j++) {
      if (j !== 0) row.append(span("or"));
      row.append(Filter({state, changeState, i, j}));
    }
    // new OR
    row.append(FilterButtons({
      onAdd: () => {
        const newFilters = [...state.filters];
        const newOrFilters = [...orFilters, {type: FilterType.First20TagsInclude, value: ""}];
        newFilters.splice(i, 1, newOrFilters);
        changeState({filters: newFilters});
      },
      onRemove: () => {
        const newFilters = [...state.filters];
        const newOrFilters = orFilters.slice(0, orFilters.length - 1);
        newFilters.splice(i, 1, newOrFilters);
        changeState({filters: newFilters});
      },
    }));
  }
  // new AND
  const buttons = column.append(FilterButtons({
    style: {marginLeft: 110},
    onAdd: () => changeState({filters: [...state.filters, [{type: FilterType.First20TagsInclude, value: ""}]]}),
    onRemove: () => changeState({filters: [...state.filters].slice(0, state.filters.length - 1)}),
  }));
});
const PAGE_SIZE = 50;
function getPageCount(state) {
  return Math.ceil((state.filteredRows?.length ?? 0) / PAGE_SIZE);
}
const Paging = makeComponent("paging", function(props) {
  const {state, changeState} = props;
  const {pageIndex} = state;
  const pageNumber = pageIndex + 1;
  const pageCount = getPageCount(state);

  const row = this.append(RowWrap({style: {marginLeft: "auto", marginTop: "auto", gap: 4}}));
  row.append(span(`Page ${pageNumber} of ${pageCount}`));
  const leftArrowDisabled = pageIndex <= 0;
  row.append(IconButton("chevron_right", {
    disabled: leftArrowDisabled,
    onClick: () => {
      if (event.shiftKey) changeState({pageIndex: 0});
      else changeState({pageIndex: pageIndex - 1});
    },
    style: {transform: "rotate(180deg)", overflow: "hidden"},
    attribute: {title: leftArrowDisabled ? "": "Hold shift to go to the start"},
  }));
  const rightArrowDisabled = pageNumber >= pageCount;
  row.append(IconButton("chevron_right", {
    disabled: rightArrowDisabled,
    onClick: (event) => {
      if (event.shiftKey) changeState({pageIndex: pageCount - 1});
      else changeState({pageIndex: pageIndex + 1});
    },
    attribute: {title: rightArrowDisabled ? "": "Hold shift to go to the end"},
  }));
});
const Table = makeComponent("table", function(props) {
  const {rows, columns} = props;
  const table = this.append(Column());
  const tableHeader = table.append(RowSplit({className: "table-header table-row"}));
  for (const column of columns) {
    tableHeader.append(span(column.label, {style: {maxWidth: column.maxWidth}}));
  }
  for (const row of rows) {
    const tableRow = table.append(RowSplit({className: "table-data table-row"}));
    for (const column of columns) {
      const cell = tableRow.append(Column({style: {maxWidth: column.maxWidth}}));
      column.render(row, cell);
    }
  }
});

function decodeCsv(value) {
  if (!value.startsWith('"')) return value;
  value = value.slice(1, value.length-1);
  return value.replace(/""/g, '"');
}
function parseData(csvText) {
  const csvLines = csvText.split(/\r?\n/).slice(1);
  const rows = [];
  const allTags_set = new Set();
  for (const line of csvLines) {
    const csvRow = line.split("; ");
    if (!line) continue;
    if (csvRow.length > 23) {
      console.error(`Invalid row: ${csvRow}`);
      continue;
    }
    const [id, name, recentReviews, ...tags] = csvRow.map(decodeCsv);
    const match = recentReviews.match(/(\d+)%.*? are positive/)
    let rating = +match?.[1];
    if (Number.isNaN(rating)) rating = 0;
    rows.push({id, name, rating, recentReviews, tags});
    for (const tag of tags) allTags_set.add(tag);
  }
  rows.sort((a, b) => b.recentReviews - a.recentReviews);
  const allTags = Array.from(allTags_set).sort();
  return {rows, allTags, allTags_set};
}

const DEFAULT_FILTERS = "v1,0,0,I20,";
function getStateFromQuery() {
  const filters = [];
  const query = getQuery();
  let pageIndex = 0;
  try {
    const f = (query.f ?? DEFAULT_FILTERS).split(",");
    const version = f[0];
    for (let offset = 1; offset < f.length; offset += 4) {
      const [i, j, type, value] = f.slice(offset, offset + 4);
      while (i >= filters.length) filters.push([]);
      const orFilters = filters[i];
      while (j >= orFilters.length) orFilters.push(undefined);
      orFilters[j] = {type, value};
    }
  } catch (error) {
    console.error(error);
  }
  try {
    if (query.p) pageIndex = Math.max(0, (+query.p) - 1);
  } catch (error) {
    console.error(error);
  }
  return {filters, pageIndex};
};
const Root = makeComponent("root", function() {
  const [state, changeState] = this.useState((diff, prevState) => {
    if (prevState == null) {
      return {
        ...getStateFromQuery(),
        dataLoading: undefined,
        rows: [],
        allTags: [],
        allTags_set: new Set(),
      };
    }
    const newState = {...prevState, ...diff};
    const newQuery = {f: "v1"};
    for (let i = 0; i < newState.filters.length; i++) {
      const orFilters = newState.filters[i];
      for (let j = 0; j < orFilters.length; j++) {
        const filter = orFilters[j];
        newQuery.f += `,${i},${j},${filter?.type ?? ""},${filter?.value ?? ""}`;
      }
    }
    if (newQuery.f === DEFAULT_FILTERS) delete newQuery.f;
    if (newState.pageIndex > 0) newQuery.p = String(newState.pageIndex + 1);
    setQuery(newQuery);
    return newState;
  });
  if (state.dataLoading === undefined) {
    state.dataLoading = true;
    fetch("steam.csv").then(async response => {
      changeState({dataLoading: false, ...parseData(await response.text())});
    });
  }
  const {rows, allTags_set} = state;
  const mappedFilters = state.filters.map(orFilters => orFilters.map(filter => {
    const {type, value} = filter;
    const filterGroup = getFilterGroup(type);
    switch (filterGroup) {
    case "tag": {
      if (!allTags_set.has(value)) return {type, value: ""};
    } break;
    case "rating": {
      if (Number.isNaN(+value)) return {type, value: 0};
    } break;
    default: {
      // noop
    } break;
    }
    return filter;
  }));
  state.filteredRows = rows.filter(row => (
    mappedFilters.every(orFilters => orFilters.some(filter => {
      if (!filter?.value) return true;
      let {type, value} = filter;
      switch (type) {
      case FilterType.First20TagsInclude: {
        return row.tags.indexOf(value) !== -1;
      } break;
      case FilterType.First20TagsExclude: {
        return row.tags.indexOf(value) === -1;
      } break;
      case FilterType.First5TagsInclude: {
        return row.tags.slice(0, 5).indexOf(value) !== -1;
      } break;
      case FilterType.First5TagsExclude: {
        return row.tags.slice(0, 5).indexOf(value) === -1;
      } break;
      case FilterType.FuzzyInclude: {
        const valueLowercase = value.toLowerCase();
        return row.tags.some(tag => tag.toLowerCase().includes(valueLowercase));
      } break;
      case FilterType.FuzzyExclude: {
        const valueLowercase = value.toLowerCase();
        return row.tags.every(tag => !tag.toLowerCase().includes(valueLowercase));
      } break;
      case FilterType.Fuzzy5Include: {
        const valueLowercase = value.toLowerCase();
        return row.tags.slice(0, 5).some(tag => tag.toLowerCase().includes(valueLowercase));
      } break;
      case FilterType.Fuzzy5Exclude: {
        const valueLowercase = value.toLowerCase();
        return row.tags.slice(0, 5).every(tag => !tag.toLowerCase().includes(valueLowercase));
      } break;
      case FilterType.RatingGTE: {
        return row.rating >= value;
      } break;
      case FilterType.RatingLTE: {
        return row.rating <= value;
      } break;
      case FilterType.NameInclude: {
        const valueLowercase = value.toLowerCase();
        return row.name.toLowerCase().includes(valueLowercase);
      } break;
      case FilterType.NameExclude: {
        const valueLowercase = value.toLowerCase();
        return !row.name.toLowerCase().includes(valueLowercase);
      } break;
      default: {
        console.error(`FilterType ${type} is not implemented!`);
      } break;
      }
    }))
  ));
  // filters
  const column = this.append(Column({style: {width: "100%", margin: 16, gap: 8}}));
  const topRow = column.append(Row({style: {width: "100%"}}));
  topRow.append(Filters({state, changeState}));
  topRow.append(Paging({state, changeState}));
  column.append(Hr({style: {width: "100%"}}));
  // table
  const {pageIndex, filteredRows} = state;
  const pagedRows = filteredRows.slice(pageIndex*PAGE_SIZE, (pageIndex+1)*PAGE_SIZE);
  column.append(Table({
    columns: [
      {
        label: "Rating",
        maxWidth: 72,
        render: (row, cell) => {
          cell.append(span(`${row.rating}%`, {style: {textAlign: "center", width: "100%"}, attribute: {title: row.recentReviews}}));
        },
      },
      {
        label: "Name",
        maxWidth: 240,
        render: (row, cell) => {
          cell.append(hyperlink(row.name, {
            href: `https://store.steampowered.com/app/${row.id}`,
            style: {lineHeight: "1.1", width: 240},
            attribute: {target: "_blank"},
          }));
        },
      },
      {
        label: "Tags",
        render: (row, cell) => {
          const tagsWrap = cell.append(RowWrap({className: "tags", style: {gap: 4}}));
          for (const tag of row.tags) {
            tagsWrap.append(span(tag, {className: "tag"}));
          }
        },
      },
    ],
    rows: pagedRows,
  }));
});
renderRoot(Root());