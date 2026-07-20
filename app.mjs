import { button, div, divider, hyperlink, makeComponent, renderRoot, span } from "./jsgui.mjs";

// html elements
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
const Input = makeComponent("input", function() {
  this.useNode(() => document.createElement("input"));
})

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

// app
const t = {
  First5TagsInclude: "First 5 tags include",
  First20TagsInclude: "First 20 tags include",
  First5TagsExclude: "First 5 tags exclude",
  First20TagsExclude: "First 20 tags exclude",
  RatingGTE: "Rating >=",
  RatingLTE: "Rating <=",
}
const FilterType = {
  First5TagsInclude: "First5TagsInclude",
  First20TagsInclude: "First20TagsInclude",
  First5TagsExclude: "First5TagsExclude",
  First20TagsExclude: "First20TagsExclude",
  RatingGTE: "RatingGTE",
  RatingLTE: "RatingLTE",
}
const FILTER_STYLES = {attribute: {name: "a", width: 140}, style: {paddingRight: 16}};
const Filter = makeComponent("filter", function(props) {
  const {state, changeState, i} = props;
  const selectedFilter = state.filters[i] ?? {
    type: FilterType.First5TagsInclude,
    value: "",
  };
  const setSelectedFilter = (diff) => {
    const newFilter = {...selectedFilter, ...diff};
    const newFilters = [...state.filters];
    newFilters.splice(i, 1, newFilter);
    changeState({filters: newFilters});
  }
  const column = this.append(Column());
  // filter type
  const filterTypeSelect = column.append(Select({
    ...FILTER_STYLES,
    events: {input: (event) => setSelectedFilter({type: event.target.value})},
  }));
  for (let filterType in FilterType) {
    filterTypeSelect.append(Option(filterType, t[filterType]));
  }
  // filter value
  const filterValueSelect = column.append(Select({
    ...FILTER_STYLES,
    events: {input: (event) => setSelectedFilter({value: event.target.value})},
  }));
  filterValueSelect.append(Option(""));
  for (const tag of state.allTags) {
    filterValueSelect.append(Option(tag));
  }
  return {
    onMount: () => {
      filterTypeSelect.node.value = selectedFilter.type;
      filterValueSelect.node.value = selectedFilter.value;
    }
  }
});
const Filters = makeComponent("filters", function(props) {
  const {state, changeState} = props;
  const row = this.append(Row({attribute: {gap: 8}}));
  for (let i = 0; i < state.filters.length; i++) {
    row.append(Filter({state, changeState, i}));
  }
  const buttons = row.append(Row());
  buttons.append(button("-", {
    attribute: {width: 30, height: 30},
    events: {
      click: () => changeState({filters: [...state.filters].slice(0, state.filters.length - 1)}),
    },
  }));
  buttons.append(button("+", {
    attribute: {width: 30, height: 30},
    events: {
      click: () => changeState({filters: [...state.filters, undefined]}),
    },
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

function parseData(csvText) {
  const csvLines = csvText.split(/\r?\n/).slice(1);
  const rows = [];
  const tags_set = new Set();
  for (const line of csvLines) {
    const csvRow = line.split("; ");
    if (csvRow.length !== 23) {
      console.error(`Invalid row: ${csvRow}`);
      break;
    }
    const [id, name, recentReviews, ...tags] = csvRow;
    rows.push({id, name, recentReviews: +recentReviews, tags});
    for (const tag of tags) tags_set.add(tag);
  }
  rows.sort((a, b) => b.recentReviews - a.recentReviews);
  const allTags = Array.from(tags_set).sort();
  return {rows, allTags};
}
const Root = makeComponent("root", function() {
  // TODO: remember filters in query
  // TODO: allow both AND and OR
  const [state, changeState] = this.useState({
    filters: [undefined],
    dataLoading: undefined,
    rows: [],
    allTags: [],
  });
  if (state.dataLoading === undefined) {
    state.dataLoading = true;
    fetch("steam.csv").then(async response => {
      changeState({dataLoading: false, ...parseData(await response.text())});
    });
  }
  console.log("state", {...state});
  // filters    
  const column = this.append(Column({attribute: {width: "max", margin: 16, gap: 8}}));
  column.append(Filters({
    state,
    changeState,
  }));
  column.append(Hr());
  // table
  let filteredRows = state.rows;
  for (const filter of state.filters) {
    if (!filter?.value) continue;
    const {type, value} = filter;
    switch (type) {
    case FilterType.First5TagsInclude: {
      filteredRows = filteredRows.filter(row => {
        const first5Tags = row.tags.slice(0, 6);
        return first5Tags.indexOf(value) !== -1;
      });
    } break;
    case FilterType.First20TagsInclude: {
      filteredRows = filteredRows.filter(row => {
        return row.tags.indexOf(value) !== -1;
      });
    } break;
    case FilterType.First5TagsExclude: {
      filteredRows = filteredRows.filter(row => {
        const first5Tags = row.tags.slice(0, 6);
        return first5Tags.indexOf(value) === -1;
      });
    } break;
    case FilterType.First20TagsExclude: {
      filteredRows = filteredRows.filter(row => {
        return row.tags.indexOf(value) === -1;
      });
    } break;
    default: {
      console.error(`FilterType ${type} is not implemented!`);
    } break;
    }
  }
  console.log({rows: state.rows, filteredRows});
  column.append(Table({
    columns: [
      {
        label: "Name",
        maxWidth: 240,
        render: (row, cell) => {
          cell.append(hyperlink(row.name, {href: `https://store.steampowered.com/app/${row.id}`, attribute: {target: "_blank"}}));
        },
      },
      {
        label: "Rating",
        maxWidth: 60,
        render: (row, cell) => {
          cell.append(span(`${row.recentReviews}%`));
        },
      },
      {
        label: "Tags",
        render: (row, cell) => {
          const tagsWrap = cell.append(RowWrap({className: "tags", attribute: {gap: 4}}));
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