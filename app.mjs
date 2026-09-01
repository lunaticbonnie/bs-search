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
const Label = makeComponent("label", function() {
  this.useNode(() => document.createElement("label"));
});
const Checkbox = makeComponent("checkbox", function (props) {
  const {id, label, checked, inputEvents} = props;
  const labelWrapper = this.append(Label({attribute: {"for": id}}));
  labelWrapper.append(Input({
    attribute: {type: "checkbox", id, ...(checked ? {checked: ""} : {})},
    events: inputEvents,
  }));
  labelWrapper.append(span(label));
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
    return (v === "") ? encodeURI(k) : `${encodeURI(k)}=${encodeURI(v)}`;
  });
  const newUrl = entries.length ? `${currentUrl}?${entries.join("&")}` : currentUrl;
  window.history.replaceState(null, "", newUrl);
}

// app
const CompareFilter = {
  GreaterOrEqual: "0",
  LesserOrEqual: "1",
  Equal: "2",
  NotEqual: "3",
};
const MatchFilter = {
  Includes: "0",
  Excludes: "1",
  FuzzyIncludes: "2",
  FuzzyExcludes: "3",
};
const FILTER_WIDTH = 170;
function compareSteps(type) {
  const COMPARE_WIDTH = 42;
  return [[
    {
      width: COMPARE_WIDTH,
      [CompareFilter.GreaterOrEqual]: {label: ">="},
      [CompareFilter.LesserOrEqual]: {label: "<="},
      [CompareFilter.Equal]: {label: "="},
      [CompareFilter.NotEqual]: {label: "!="},
    },
    {
      width: FILTER_WIDTH - COMPARE_WIDTH,
      type,
    },
  ]];
}
const FILTERS = {
  width: FILTER_WIDTH,
  F: {
    label: "First",
    steps: [
      [
        {
          width: 68,
          type: "tagCount",
          suffix: " tags",
        },
        {
          width: 102,
          [MatchFilter.Includes]: {label: "include"},
          [MatchFilter.Excludes]: {label: "exclude"},
          [MatchFilter.FuzzyIncludes]: {label: "fuzzy include"},
          [MatchFilter.FuzzyExcludes]: {label: "fuzzy exclude"},
        },
      ],
      (prevSteps) => {
        const isFuzzy = [MatchFilter.FuzzyIncludes, MatchFilter.FuzzyExcludes].includes(prevSteps[prevSteps.length - 1]);
        console.log("isFuzzy", prevSteps, isFuzzy)
        return isFuzzy ? "text" : "tag";
      },
    ],
  },
  T: {
    label: "Tag count",
    steps: compareSteps("tagCount"),
  },
  R: {
    label: "Rating%",
    steps: compareSteps("rating"),
  },
  C: {
    label: "Review count",
    steps: compareSteps("count"),
  },
  N: {
    label: "Name",
    steps: [
      {
        [MatchFilter.Includes]: {label: "includes"},
        [MatchFilter.Excludes]: {label: "excludes"},
        [MatchFilter.FuzzyIncludes]: {label: "fuzzy includes"},
        [MatchFilter.FuzzyExcludes]: {label: "fuzzy excludes"},
      },
      (prevSteps) => ({
        width: prevSteps[prevSteps.length - 1].startsWith("C") ? 500 : undefined,
        type: "text",
      }),
    ],
  },
};
function _computeFilterSize(info) {
  let n = 1;
  for (const step of info.steps) {
    if (Array.isArray(step)) {
      for (const _substep of step) {
        n++;
      }
    } else {
      n++;
    }
  }
  return n;
}
const FILTER_SIZE = Object.fromEntries(Object.entries(resolveFilter(FILTERS, []).extra).map(([k, v]) => [k, _computeFilterSize(v)]));
function resolveFilter(filterDefinition, prevValues) {
  if (typeof filterDefinition === "function") filterDefinition = filterDefinition(prevValues)
  if (typeof filterDefinition === "string") return {type: filterDefinition};
  const {type = "select", width, suffix, steps, ...extra} = filterDefinition;
  return { type, width, suffix, steps, extra };
}
/* TODO: simplify to
  - First + N tags + include/exclude/fuzzy include/fuzzy exclude
  - Tag count + includes/excludes
  - Name + includes/excludes/csv includes/csv excludes
  - Rating% + >=/<=
  - Review count + >=/<=
*/
// TODO: `paddingRight: 16` on selects
const DEFAULT_FILTER = ["F", "", "I", 20];
const Filter = makeComponent("filter", function (props) {
  const {state, changeState, i, j} = props;
  const filterValue = state.filters[i][j];
  const changeFilter = (newValue, stepIndex) => {
    const newFilters = [...state.filters];
    const newOrFilters = [...state.filters[i]];
    const newFilter = [...filterValue];
    newFilter.splice(stepIndex, 1, newValue);
    newOrFilters.splice(j, 1, newFilter);
    newFilters.splice(i, 1, newOrFilters);
    changeState({filters: newFilters, pageIndex: 0});
  }
  // render type select
  let prevStepCount = 0;
  const renderSubstep = (parent, filterDefinition, stepIndex) => {
    parent.append(FilterStep({
      key: stepIndex,
      allTags: state.allTags,
      info: resolveFilter(filterDefinition, filterValue.slice(0, prevStepCount++)),
      stepValue: filterValue[stepIndex],
      changeStep: (newValue) => changeFilter(newValue, stepIndex),
    }));
  }
  try {
    // render filter type
    const wrapper = this.append(RowWrap({style: {gap: 4}}));
    const column = wrapper.append(Column());
    renderSubstep(column, FILTERS, 0);
    // render filter steps
    const filterType = filterValue[0];
    let stepIndex = FILTER_SIZE[filterType];
    const {steps = []} = FILTERS[filterType];
    for (const step of steps) {
      if (Array.isArray(step)) {
        const row = column.append(Row());
        for (const substep of step) {
          renderSubstep(row, substep, --stepIndex);
        }
      } else {
        renderSubstep(column, step, --stepIndex);
      }
    }
    if (filterType === "F" && filterValue[1] === "Free to Play") {
      wrapper.append(Icon("warning", {
        className: ["filter-warning"],
        attribute: {title: "Two thirds of free games are missing this tag."},
      }));
    }
  } catch (error) {
    console.error(error);
  }
});
const FilterStep = makeComponent("filterStep", function(props) {
  const {allTags, info, stepValue, changeStep} = props;
  const {type, width = FILTER_WIDTH, suffix = "", extra} = info;
  console.log(info);
  let input;
  if (type === "select") {
    input = this.append(Select({
      style: {width, paddingRight: 16},
      attribute: {name: type},
      events: {input: (event) => changeStep(event.target.value)},
    }));
    for (const [id, subInfo] of Object.entries(extra)) {
      const {label} = subInfo;
      input.append(Option(id, label));
    }
  } else if (type === "tag") {
    input = this.append(Select({
      style: {width, paddingRight: 16},
      attribute: {name: type},
      events: {input: (event) => changeStep(event.target.value)},
    }));
    input.append(Option(""));
    for (const tag of allTags) {
      input.append(Option(tag));
    }
  } else if (type === "text") {
    input = this.append(Input({
      style: {width},
      attribute: {name: type},
      events: {input: (event) => changeStep(event.target.value)},
    }));
  } else if (type === "tagCount") {
    if (suffix) {
      input = this.append(Select({
        style: {width, paddingRight: 16},
        attribute: {name: type},
        events: {input: (event) => changeStep(event.target.value)},
      }));
    } else {
      input = this.append(Input({
        style: {width},
        attribute: {name: type, type: "number", step: 1, min: 0, max: 20},
        events: {input: (event) => changeStep(event.target.value)},
      }));
    }
    for (let n = 20; n >= 0; n--) {
      input.append(Option(n, `${n}${suffix}`));
    }
  } else if (type === "rating") {
    input = this.append(Input({
      style: {width},
      attribute: {name: type, type: "number", step: 1, min: 0, max: 100},
      events: {input: (event) => changeStep(event.target.value)},
    }));
  } else if (type === "count") {
    input = this.append(Input({
      style: {width},
      attribute: {name: type, type: "number", step: 1},
      events: {input: (event) => changeStep(event.target.value)},
    }));
  }
  // controlled input
  return {
    onMount: () => {
      if (input) input.node.value = stepValue;
      else console.error(`Unhandled filter type`, info);
    }
  };
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
      row.append(Filter({state, changeState, i, j, stepIndex: 0}));
    }
    // new OR
    row.append(FilterButtons({
      onAdd: () => {
        const newFilters = [...state.filters];
        const newOrFilters = [...orFilters, DEFAULT_FILTER];
        newFilters.splice(i, 1, newOrFilters);
        changeState({filters: newFilters});
      },
      onRemove: () => {
        const newFilters = [...state.filters];
        const newOrFilters = orFilters.slice(0, orFilters.length - 1);
        if (newOrFilters.length === 0) newFilters.splice(i, 1);
        else newFilters.splice(i, 1, newOrFilters);
        changeState({filters: newFilters});
      },
    }));
  }
  // new AND
  const buttons = column.append(FilterButtons({
    style: {marginLeft: 110},
    onAdd: () => changeState({filters: [...state.filters, [DEFAULT_FILTER]]}),
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

  const row = this.append(RowWrap({style: {
    marginTop: "auto",
    gap: 4,
    ...props.style,
  }}));
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
function getNextSort(sort, id) {
  if (sort != null && sort.id === id) {
    return !sort.ascending ? {id, ascending: true} : null;
  }
  return {id, ascending: false};
}
const Table = makeComponent("table", function(props) {
  const {rows, columns, sort, onChangeSort} = props;
  const table = this.append(Column());
  const tableHeaderRow = table.append(RowSplit({className: "table-header-row table-row"}));
  for (const column of columns) {
    const {id, maxWidth, label, disableSorting} = column;
    let dataSort = "";
    if (sort != null && sort.id === id) {
      dataSort = sort.ascending ? "asc" : "desc";
    }
    const tableHeader = tableHeaderRow.append(RowWrap({
      key: id,
      style: {maxWidth: maxWidth},
      className: "table-header",
      attribute: {dataSortable: !disableSorting, dataSort},
      events: !disableSorting ? {click: () => onChangeSort(getNextSort(sort, id))} : {},
    }));
    tableHeader.append(span(label));
    if (!disableSorting) tableHeader.append(Icon("arrow_downward", {className: ["table-sort-arrow"]}));
  }
  for (const row of rows) {
    const tableRow = table.append(RowSplit({className: "table-data table-row"}));
    for (const column of columns) {
      const cell = tableRow.append(Column({key: column.id, style: {maxWidth: column.maxWidth}}));
      column.render(row, cell);
    }
  }
});

function decodeCsv(value) {
  if (!value.startsWith('"')) return value;
  value = value.slice(1, value.length-1);
  return value.replace(/""/g, '"');
}
function parseRowV1(csvRow) {
  const [id, name, recentReviews, ...tags] = csvRow.map(decodeCsv);
  let rating = +recentReviews.match(/(\d+)%.*? are positive/)?.[1];
  if (Number.isNaN(rating)) rating = 0;
  const reviewsMatch = recentReviews.match(/([\d,]+) user reviews.*? are positive/)?.[1];
  let reviews = 0;
  if (reviewsMatch) reviews = +reviewsMatch.replace(/,/g, "");
  else if (recentReviews.startsWith("Need more")) reviews = 5;
  if (Number.isNaN(reviews)) reviews = 0;
  return {id, name, rating, recentReviews, reviews, tags};
}
function parseRowV2(csvRow) {
  let [id, name, recentReviews, totalReviews, ...tags] = csvRow.map(decodeCsv);
  totalReviews = totalReviews.trim();
  totalReviews = totalReviews.startsWith("(") ? totalReviews.slice(1, -1) : totalReviews;
  // parse `recentReviews`
  let rating = +recentReviews.match(/(\d+)%.*? are positive/)?.[1];
  if (Number.isNaN(rating)) rating = 0;
  let reviewsMatch;
  if (totalReviews) {
    reviewsMatch = totalReviews.match(/([\d,]+)/)?.[1];
  } else {
    reviewsMatch = recentReviews.match(/([\d,]+) user reviews.*? are positive/)?.[1];
  }
  // parse `totalReviews`
  let reviews = 0;
  if (reviewsMatch) reviews = +reviewsMatch.replace(/,/g, "");
  else if (recentReviews.startsWith("Need more")) reviews = 5;
  if (Number.isNaN(reviews)) reviews = 0;
  return {id, name, rating, recentReviews, reviews, totalReviews, tags};
}
const VERSION_MAP = {
  v1: [parseRowV1, 23],
  v2: [parseRowV2, 24],
};
function parseCsvRow(csvLine) {
  const /** @type {string[]} */ acc = [];
  let i = 0;
  let j = 0;
  while (i < csvLine.length) {
    while (i < csvLine.length && csvLine[i] === ' ') i++;
    j = i;
    if (i < csvLine.length && csvLine[i] === '"') {
      // quoted csv
      i += 1;
      j += 2;
      while (j < csvLine.length) {
        if (csvLine[j] === '"') {
          if (j+1 < csvLine.length, csvLine[j+1] === '"') {
            j += 2;
            continue;
          } else {
            break;
          }
        }
        j += 1;
      }
      acc.push(csvLine.slice(i, j).replace(/""/g, "\""));
      while (j < csvLine.length && csvLine[j] !== ';') j++;
      j += 1;
    } else {
      // unquoted csv
      while (j < csvLine.length && csvLine[j] !== ';') j++;
      acc.push(csvLine.slice(i, j).trim());
      j += 1;
    }
    i = j;
  }
  return acc;
}
function parseData(csvText) {
  // parse version
  let csvLines = csvText.split(/\r?\n/);
  const firstLine = csvLines[0];
  let version = "v1";
  if (firstLine.startsWith("v")) {
    version = firstLine;
    csvLines = csvLines.slice(1);
  }
  const [parseRow, expectedColumnCount] = VERSION_MAP[version];
  // parse rows
  const rows = [];
  const allTags_set = new Set();
  for (const csvLine of csvLines) {
    if (!csvLine) continue;
    const csvRow = parseCsvRow(csvLine);
    if (csvRow.length > expectedColumnCount) {
      console.error("Invalid row:", csvRow);
      continue;
    }
    const row = parseRow(csvRow);
    rows.push(row);
    for (const tag of row.tags) allTags_set.add(tag);
  }
  const allTags = Array.from(allTags_set).sort();
  const key = (row) => row.rating * row.reviews;
  rows.sort((a, b) => {
    const key_a = key(a);
    const key_b = key(b);
    return (key_a < key_b) - (key_a > key_b);
  });
  return {rows, allTags, allTags_set};
}
function encodeURIParts(array) {
  return array.map(encodeURIPart).join(",");
}
function encodeURIPart(v) {
  return String(v).replace(/[&,]/g, (m) => m[0] === "&" ? "%26" : "%2C");
}
function decodeURIPart(v) {
  return decodeURIComponent(v);
}
function getStateFromQuery() {
  const query = getQuery();
  // get `filters`
  const filters = [];
  try {
    let f = query.f ? query.f.split(",") : [0, 0, ...DEFAULT_FILTER];
    if (f[0] === "v1") f = [];
    let offset = 0;
    let prevOffset = 0;
    const filterSize = Object.values(FILTER_SIZE).reduce((acc, v) => Math.max(acc, v));
    while (offset < f.length) {
      const [i, j] = f.slice(offset, offset + 2);
      offset += 2;
      const values = f.slice(offset, offset + filterSize);
      offset += filterSize;
      while (i >= filters.length) filters.push([]);
      const orFilters = filters[i];
      while (j >= orFilters.length) orFilters.push(DEFAULT_FILTER);
      orFilters[j] = values;
      if (offset === prevOffset) {
        console.error("Broken query.f parser!");
        break;
      }
      prevOffset = offset;
    }
  } catch (error) {
    console.error(error);
  }
  // get `sort`
  let sort = null;
  try {
    if (query.s) {
      const [id, ascending] = query.s.split(",");
      sort = {id, ascending: ascending !== "d"};
    }
  } catch (error) {
    console.error(error);
  }
  // get `showCount`
  const showCount = "c" in query;
  // get `markRecent`
  const markRecent = "r" in query;
  // get `pageIndex`
  let pageIndex = 0;
  try {
    if (query.p) pageIndex = Math.max(0, (+query.p) - 1);
  } catch (error) {
    console.error(error);
  }
  return {filters, sort, showCount, markRecent, pageIndex};
};
function getTagHighlight(i, tag, filters) {
  return false;
  // TODO: getTagHighlight()
  for (const filter of filters) {
    switch (filter.type) {
    case FilterType.First20TagsInclude:
    case FilterType.First5TagsInclude: {
      if (filter.value === tag) return true;
    } break;
    case FilterType.Fuzzy5Include: {
      if (i >= 5) return false;
    } // fallthrough
    case FilterType.Fuzzy20Include: {
      if (tag.toLowerCase().includes(filter.value.toLowerCase())) return true;
    } break;
    }
  }
  return false;
}
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
    const newQuery = {f: ""};
    for (let i = 0; i < newState.filters.length; i++) {
      const orFilters = newState.filters[i];
      for (let j = 0; j < orFilters.length; j++) {
        const filterValues = orFilters[j];
        newQuery.f += `${newQuery.f ? "," : ""}${i},${j},${encodeURIParts(filterValues)}`;
      }
    }
    if (newQuery.f === `0,0,${encodeURIParts(DEFAULT_FILTER)}` || newQuery.f === "") delete newQuery.f;
    if (newState.sort) newQuery.s = `${newState.sort.id},${newState.sort.ascending ? "a" : "d"}`;
    if (newState.showCount) newQuery.c = "";
    if (newState.markRecent) newQuery.r = "";
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
  const {rows, allTags_set, sort, showCount, markRecent} = state;
  const mappedFilters = state.filters.map(orFilters => orFilters.map(filter => {
    return filter;
    // TODO: map filters
    const {type, value} = filter;
    const filterGroup = getFilterGroup(type);
    switch (filterGroup) {
    case "tag": {
      if (!allTags_set.has(value)) return {type, value: ""};
    } break;
    case "rating":
    case "count": {
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
      case FilterType.Fuzzy20Include: {
        const valueLowercase = value.toLowerCase();
        return row.tags.some(tag => tag.toLowerCase().includes(valueLowercase));
      } break;
      case FilterType.Fuzzy20Exclude: {
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
      case FilterType.ReviewCountGTE: {
        return row.reviews >= value;
      } break;
      case FilterType.ReviewCountLTE: {
        return row.reviews <= value;
      } break;
      case FilterType.NameInclude: {
        const valueLowercase = value.toLowerCase();
        return row.name.toLowerCase().includes(valueLowercase);
      } break;
      case FilterType.CSVNameInclude: {
        const rowNameLowercase = row.name.toLowerCase();
        const csvNames = value.toLowerCase().split(",").map(v => v.trim()).filter(v => v);
        return csvNames.some(v => rowNameLowercase.includes(v));
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
  if (sort != null) {
    const {id, ascending} = sort;
    // NOTE: optimization - manually pull out loop invariants
    switch (id) {
    case "R": {
      if (ascending) {
        state.filteredRows.sort((a, b) => {
          const a_key = a.rating;
          const b_key = b.rating;
          return (a_key > b_key) - (a_key < b_key);
        });
      } else {
        state.filteredRows.sort((a, b) => {
          const a_key = a.rating;
          const b_key = b.rating;
          return (a_key < b_key) - (a_key > b_key);
        });
      }
    } break;
    case "C": {
      if (ascending) {
        state.filteredRows.sort((a, b) => {
          const a_key = a.reviews;
          const b_key = b.reviews;
          return (a_key > b_key) - (a_key < b_key);
        });
      } else {
        state.filteredRows.sort((a, b) => {
          const a_key = a.reviews;
          const b_key = b.reviews;
          return (a_key < b_key) - (a_key > b_key);
        });
      }
    } break;
    case "N": {
      if (ascending) {
        state.filteredRows.sort((a, b) => {
          const a_key = a.name;
          const b_key = b.name;
          return (a_key > b_key) - (a_key < b_key);
        });
      } else {
        state.filteredRows.sort((a, b) => {
          const a_key = a.name;
          const b_key = b.name;
          return (a_key < b_key) - (a_key > b_key);
        });
      }
    } break;
    default: {
      console.error(`Invalid sort id: '${id}'`);
    };
    }
  }
  // filters
  const column = this.append(Column({style: {width: "100%", margin: 16, gap: 8}}));
  const topRow = column.append(Row({style: {width: "100%"}}));
  topRow.append(Filters({state, changeState}));
  const rightPanel = topRow.append(ColumnWrap({style: {marginLeft: "auto", height: "100%", gap: 4}}));
  rightPanel.append(Checkbox({
    id: "showCount",
    label: "Show review count",
    checked: showCount,
    inputEvents: {input: (event) => changeState({showCount: event.target.checked})},
    style: {marginLeft: "auto"},
  }));
  rightPanel.append(Checkbox({
    id: "markRecent",
    label: "Mark recent",
    checked: markRecent,
    inputEvents: {input: (event) => changeState({markRecent: event.target.checked})},
    style: {marginLeft: "auto"},
  }));
  rightPanel.append(Paging({state, changeState}));
  column.append(Hr({style: {width: "100%"}}));
  // table
  const {pageIndex, filteredRows} = state;
  const pagedRows = filteredRows.slice(pageIndex*PAGE_SIZE, (pageIndex+1)*PAGE_SIZE);
  const flatFilters = mappedFilters.flatMap(v => v);
  column.append(Table({
    columns: [
      {
        id: "R",
        label: "Rating",
        maxWidth: showCount ? 76 : 80,
        render: (row, cell) => {
          cell.append(span(`${row.rating}%`, {style: {textAlign: "center", width: "100%"}, attribute: {title: row.recentReviews}}));
        },
      },
      ...(showCount ? [{
        id: "C",
        label: "Count",
        maxWidth: 76,
        render: (row, cell) => {
          let {reviews} = row;
          let unit = "";
          if (reviews < 10) {
            reviews = "<10";
          } else {
            // find unit
            if (reviews >= 1000) {
              reviews /= 1000;
              unit = "K";
            }
            if (reviews >= 1000) {
              reviews /= 1000;
              unit = "M";
            }
            if (reviews >= 1000) {
              reviews /= 1000;
              unit = "B";
            }
            // round
            if (reviews < 1.1) {
              reviews = Math.round(reviews * 100) / 100;
            } else if (reviews < 11) {
              reviews = Math.round(reviews * 10) / 10;
            } else{
              reviews = Math.round(reviews);
            }
          }
          const recentMarker = markRecent && !row.totalReviews && row.recentReviews.includes("in the last") ? "~" : "";
          cell.append(span(`${recentMarker}${reviews}${unit}`, {
            style: {textAlign: "center", width: "100%"},
            attribute: {
              title: (row.totalReviews || row.recentReviews).replace(/<br>/g, "\n"),
            },
          }));
        },
      }] : []),
      {
        id: "N",
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
        id: "T",
        label: "Tags",
        render: (row, cell) => {
          const tagsWrap = cell.append(RowWrap({className: "tags", style: {gap: 4}}));
          for (let i = 0; i < row.tags.length; i++) {
            const tag = row.tags[i];
            const highlight = getTagHighlight(i, tag, flatFilters);
            tagsWrap.append(span(tag, {key: i, className: highlight ? "tag tag-highlight" : "tag"}));
          }
        },
        disableSorting: true,
      },
    ],
    rows: pagedRows,
    sort,
    onChangeSort: (sort) => changeState({sort}),
  }));
  column.append(Paging({
    state,
    changeState: (diff) => {
      changeState(diff);
      document.documentElement.scrollTo(0, 0);
    },
    style: {marginLeft: "auto", marginRight: 0, marginTop: -8, paddingBottom: 4},
  }));
});
renderRoot(Root());