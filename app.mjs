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
  First20TagsInclude: "First 20 tags include",
  First5TagsInclude: "First 5 tags include",
  First20TagsExclude: "First 20 tags exclude",
  First5TagsExclude: "First 5 tags exclude",
  RatingGTE: "Rating >=",
  RatingLTE: "Rating <=",
}
const FilterType = {
  First20TagsInclude: "First20TagsInclude",
  First5TagsInclude: "First5TagsInclude",
  First20TagsExclude: "First20TagsExclude",
  First5TagsExclude: "First5TagsExclude",
  RatingGTE: "RatingGTE",
  RatingLTE: "RatingLTE",
}
const FILTER_STYLES = {attribute: {name: "a", width: 140}, style: {paddingRight: 16}};
const Filter = makeComponent("filter", function(props) {
  const {state, changeState, i, j} = props;
  console.log({i, j})
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
const FilterButtons = makeComponent("filter-buttons", function (props) {
  const {onAdd, onRemove} = props;
  const buttons = this.append(Row());
  buttons.append(button("-", {
    attribute: {width: 30, height: 30},
    events: {click: onRemove},
  }));
  buttons.append(button("+", {
    attribute: {width: 30, height: 30},
    events: {click: onAdd},
  }));
});
const Filters = makeComponent("filters", function(props) {
  const {state, changeState} = props;
  const column = this.append(Column({attribute: {gap: 8}}));
  // existing filters
  for (let i = 0; i < state.filters.length; i++) {
    const row = column.append(RowWrap({attribute: {gap: 8}}));
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
    onAdd: () => changeState({filters: [...state.filters, [undefined]]}),
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
  const [state, changeState] = this.useState({
    filters: [[undefined]],
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
  column.append(Filters({state, changeState}));
  column.append(Hr({attribute: {width: "max"}}));
  // table
  const filteredRows = state.rows.filter(row => (
    state.filters.every(orFilters => orFilters.some(filter => {
      if (!filter?.value) return true;
      const {type, value} = filter;
      console.log("ayaya.filter", filter);
      switch (type) {
      case FilterType.First20TagsInclude: {
        return row.tags.indexOf(value) !== -1;
      } break;
      case FilterType.First5TagsInclude: {
        return row.tags.slice(0, 6).indexOf(value) !== -1;
      } break;
      case FilterType.First20TagsExclude: {
        return row.tags.indexOf(value) === -1;
      } break;
      case FilterType.First5TagsExclude: {
        return row.tags.slice(0, 6).indexOf(value) === -1;
      } break;
      default: {
        console.error(`FilterType ${type} is not implemented!`);
      } break;
      }
    }))
  ));
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