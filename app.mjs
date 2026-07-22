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
  RatingGTE: "RG",
  RatingLTE: "RL",
};
const t = {
  [FilterType.First20TagsInclude]: "First 20 tags include",
  [FilterType.First20TagsExclude]: "First 20 tags exclude",
  [FilterType.First5TagsInclude]: "First 5 tags include",
  [FilterType.First5TagsExclude]: "First 5 tags exclude",
  [FilterType.FuzzyInclude]: "Fuzzy include",
  [FilterType.FuzzyExclude]: "Fuzzy exclude",
  [FilterType.RatingGTE]: "Rating% >=",
  [FilterType.RatingLTE]: "Rating% <=",
};
const FILTER_INPUT_STYLES = {style: {width: 146}, attribute: {name: "a"}};
const FILTER_SELECT_STYLES = {
  ...FILTER_INPUT_STYLES,
  style: {...FILTER_INPUT_STYLES.style, paddingRight: 16},
};
const Filter = makeComponent("filter", function(props) {
  const {state, changeState, i, j} = props;
  const selectedFilter = state.filters[i][j] ?? {
    type: FilterType.First20TagsInclude,
    value: "",
  };
  const setSelectedFilter = (diff) => {
    const newFilters = [...state.filters];
    
    const newOrFilters = [...state.filters[i]];
    const newFilter = {...selectedFilter, ...diff};
    newOrFilters.splice(j, 1, newFilter);

    newFilters.splice(i, 1, newOrFilters);
    changeState({filters: newFilters});
  }
  const column = this.append(Column());
  // filter type
  const filterTypeSelect = column.append(Select({
    ...FILTER_SELECT_STYLES,
    events: {input: (event) => setSelectedFilter({type: event.target.value})},
  }));
  for (const filterType of Object.values(FilterType)) {
    filterTypeSelect.append(Option(filterType, t[filterType]));
  }
  // filter value
  let filterValueInput;
  switch (selectedFilter.type) {
  case FilterType.RatingGTE:
  case FilterType.RatingLTE: {
    filterValueInput = column.append(Input({
      ...FILTER_INPUT_STYLES,
      attribute: {...FILTER_INPUT_STYLES.attribute, type: "number", min: 0, max: 100, step: 1},
      events: {input: (event) => setSelectedFilter({value: event.target.value})},
    }));
  } break;
  case FilterType.FuzzyInclude:
  case FilterType.FuzzyExclude: {
    filterValueInput = column.append(Input({
      ...FILTER_INPUT_STYLES,
      events: {input: (event) => setSelectedFilter({value: event.target.value})},
    }))
  } break;
  default: {
    filterValueInput = column.append(Select({
      ...FILTER_SELECT_STYLES,
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
        const newOrFilters = [...orFilters, undefined];
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
  const tags_set = new Set();
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
    for (const tag of tags) tags_set.add(tag);
  }
  rows.sort((a, b) => b.recentReviews - a.recentReviews);
  const allTags = Array.from(tags_set).sort();
  return {rows, allTags};
}

const DEFAULT_FILTERS = "v1,0,0,I20,";
function getFiltersFromQuery() {
  const acc = [];
  const query = getQuery();
  try {
    const f = (query.f ?? DEFAULT_FILTERS).split(",");
    const version = f[0];
    for (let offset = 1; offset < f.length; offset += 4) {
      const [i, j, type, value] = f.slice(offset, offset + 4);
      while (i >= acc.length) acc.push([]);
      const orFilters = acc[i];
      while (j >= orFilters.length) orFilters.push(undefined);
      orFilters[j] = {type, value};
    }
  } catch (error) {
    console.error(error);
  }
  return acc;
};
const startingFilters = getFiltersFromQuery();
const Root = makeComponent("root", function() {
  const [state, changeState] = this.useState((diff, prevState) => {
    if (prevState == null) {
      return {
        filters: startingFilters,
        dataLoading: undefined,
        rows: [],
        allTags: [],
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
    setQuery(newQuery);
    return newState;
  });
  if (state.dataLoading === undefined) {
    state.dataLoading = true;
    fetch("steam.csv").then(async response => {
      changeState({dataLoading: false, ...parseData(await response.text())});
    });
  }
  // filters
  const column = this.append(Column({style: {width: "100%", margin: 16, gap: 8}}));
  column.append(Filters({state, changeState}));
  column.append(Hr({style: {width: "100%"}}));
  // table
  const filteredRows = state.rows.filter(row => (
    state.filters.every(orFilters => orFilters.some(filter => {
      if (!filter?.value) return true;
      const {type, value} = filter;
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
      case FilterType.RatingGTE: {
        return row.rating >= value;
      } break;
      case FilterType.RatingLTE: {
        return row.rating <= value;
      } break;
      default: {
        console.error(`FilterType ${type} is not implemented!`);
      } break;
      }
    }))
  ));
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
    rows: filteredRows,
  }));
});
renderRoot(Root());