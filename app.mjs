import { button, div, divider, makeComponent, renderRoot, span } from "./jsgui.mjs";

// html elements
const Select = makeComponent("select", function() {
  this.useNode(() => document.createElement("select"));
});
const Option = makeComponent("option", function(label, props) {
  const z = this.useNode(() => document.createElement("option"));
  z.innerText = label;
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

const FilterType = {
  First5TagsInclude: "First 5 tags include",
  First20TagsInclude: "First 20 tags include",
  First5TagsExclude: "First 5 tags exclude",
  RatingGTE: "Rating >=",
  RatingLTE: "Rating <=",
}
const FILTER_STYLES = {name: "a", width: 140};
const Filter = makeComponent("filter", function() {
  const column = this.append(Column());
  const select = column.append(Select({attribute: FILTER_STYLES}));
  for (let filterType in FilterType) {
    select.append(Option(FilterType[filterType]));
  }
  column.append(Input({attribute: FILTER_STYLES}));
});
const Filters = makeComponent("filters", function(props) {
  const {filters, setFilters} = props;
  const row = this.append(Row({attribute: {gap: 8}}));
  for (let i = 0; i < filters.length; i++) {
    row.append(Filter());
  }
  row.append(button("+", {
    attribute: {width: 40, height: 40},
    events: {
      click: () => setFilters([...filters, undefined]),
    },
  }))
});

const Root = makeComponent("root", function() {
  // TODO: remember filters in query
  const [state, setState] = this.useState({
    filters: [undefined],
  });
  const column = this.append(Column({attribute: {width: "max", margin: 16, gap: 8}}));
  column.append(Filters({
    filters: state.filters,
    setFilters: (filters) => setState({...state, filters}),
  }));
  column.append(Hr());
  column.append(span("table"));
});
renderRoot(Root());