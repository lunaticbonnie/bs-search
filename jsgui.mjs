function getCurrentTimeZone()/*: string*/ {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const DEFAULT_DATE_FORMAT/*: Intl.DateTimeFormatOptions*/ = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZoneName: "shortOffset",
};
function formatDate(
  date/*: Date*/,
  timeZone/*: string | undefined*/,
  locale/*?: string*/,
  options/*?: Pick<Intl.DateTimeFormatOptions, 'year' | 'month' | 'day' | 'timeZoneName'>*/,
) {
  return new Intl.DateTimeFormat(locale, {...DEFAULT_DATE_FORMAT, ...options, timeZone}).format(date);
}

const DEFAULT_TIME_FORMAT/*: Intl.DateTimeFormatOptions*/ = {
  hourCycle: "h23",
  hour: "2-digit",
  minute: "2-digit",
};
function formatDateTime(
  date/*: Date*/,
  timeZone/*: string | undefined*/,
  locale/*?: string*/,
  options/*?: Omit<Intl.DateTimeFormatOptions, "timeZone">*/,
)/*: string*/ {
  return new Intl.DateTimeFormat(locale, {...DEFAULT_DATE_FORMAT, ...DEFAULT_TIME_FORMAT, ...options, timeZone}).format(date);
}

function formatDateIso(
  date/*: Date*/,
  timeZone/*: string*/ = "GMT",
)/*: string*/ {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    fractionalSecondDigits: 3,
    timeZoneName: 'longOffset',
    timeZone,
  });
  const parts_array = formatter.formatToParts(date);
  const parts = {} /*as Record<keyof Intl.DateTimeFormatPartTypesRegistry, string>*/;
  for (let part of parts_array) {
    parts[part.type] = part.value;
  }
  const {year, month, day, hour, minute, second, fractionalSecond, timeZoneName} = parts;
  const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.${fractionalSecond}${timeZoneName.slice(3) || 'Z'}`;
  return isoString;
}
function areDatesEqual(a/*: Date | null | undefined*/, b/*: Date | null | undefined*/) {
  return a == null || b == null ? a == b : formatDateIso(a) === formatDateIso(b);
}
/*export type vec2 = {x: number; y: number}*/;
function vec2(x/*: number*/, y/*: number*/)/*: vec2*/ {
  return {x, y};
}
/*export type vec3 = {x: number; y: number, z: number}*/;
function vec3(x/*: number*/, y/*: number*/, z/*: number*/)/*: vec3*/ {
  return {x, y, z};
}

// basic operations
function vec2_add(A/*: vec2*/, B/*: vec2*/)/*: vec2*/ {
  return {x: A.x + B.x, y: A.y + B.y};
}
function vec3_add(A/*: vec3*/, B/*: vec3*/)/*: vec3*/ {
  return {x: A.x + B.x, y: A.y + B.y, z: A.z + B.z};
}

function vec2_sub(A/*: vec2*/, B/*: vec2*/)/*: vec2*/ {
  return {x: A.x - B.x, y: A.y - B.y};
}
function vec3_sub(A/*: vec3*/, B/*: vec3*/)/*: vec3*/ {
  return {x: A.x - B.x, y: A.y - B.y, z: A.z - B.z};
}

function vec2_mulf(A/*: vec2*/, b/*: number*/)/*: vec2*/ {
  return {x: A.x * b, y: A.y * b};
}
function vec3_mulf(A/*: vec3*/, b/*: number*/)/*: vec3*/ {
  return {x: A.x * b, y: A.y * b, z: A.z * b};
}

function vec2_mul(A/*: vec2*/, B/*: vec2*/)/*: vec2*/ {
  return {x: A.x * B.x, y: A.y * B.y};
}
function vec3_mul(A/*: vec3*/, B/*: vec3*/)/*: vec3*/ {
  return {x: A.x * B.x, y: A.y * B.y, z: A.z * B.z};
}

function vec2_div(A/*: vec2*/, B/*: vec2*/)/*: vec2*/ {
  return {x: A.x / B.x, y: A.y / B.y};
}
function vec3_div(A/*: vec3*/, B/*: vec3*/)/*: vec3*/ {
  return {x: A.x / B.x, y: A.y / B.y, z: A.z / B.z};
}

// fancy operations
function vec2_min_component(A/*: vec2*/)/*: number*/ {
  return Math.min(A.x, A.y);
}
function vec3_min_component(A/*: vec3*/)/*: number*/ {
  return Math.min(A.x, A.y, A.z);
}

function vec2_max_component(A/*: vec2*/)/*: number*/ {
  return Math.max(A.x, A.y);
}
function vec3_max_component(A/*: vec3*/)/*: number*/ {
  return Math.max(A.x, A.y, A.z);
}

function vec2_dot(A/*: vec2*/, B/*: vec2*/)/*: number*/ {
  return A.x*B.x + A.y*B.y;
}
function vec3_dot(A/*: vec3*/, B/*: vec3*/)/*: number*/ {
  return A.x*B.x + A.y*B.y + A.z*B.z;
}

function vec2_circle_norm(A/*: vec2*/)/*: number*/ {
  const {x, y} = A
  return Math.sqrt(x*x + y*y);
}
function vec3_circle_norm(A/*: vec3*/)/*: number*/ {
  const {x, y, z} = A
  return Math.sqrt(x*x + y*y + z*z);
}

function vec2_clamp_to_circle(A/*: vec2*/)/*: vec2*/ {
  const circle_norm = vec2_circle_norm(A);
  return circle_norm > 1 ? vec2_mulf(A, 1/circle_norm) : A;
}
function vec3_clamp_to_circle(A/*: vec3*/)/*: vec3*/ {
  const circle_norm = vec3_circle_norm(A);
  return circle_norm > 1 ? vec3_mulf(A, 1/circle_norm) : A;
}

function vec2_square_norm(A/*: vec2*/)/*: number*/ {
  const {x, y} = A
  return Math.max(Math.abs(x), Math.abs(y));
}
function vec3_square_norm(A/*: vec3*/)/*: number*/ {
  const {x, y, z} = A
  return Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
}

function vec2_clamp_to_square(A/*: vec2*/)/*: vec2*/ {
  const square_norm = vec2_square_norm(A);
  return square_norm > 1 ? vec2_mulf(A, 1/square_norm) : A;
}
function vec3_clamp_to_square(A/*: vec3*/)/*: vec3*/ {
  const square_norm = vec3_square_norm(A);
  return square_norm > 1 ? vec3_mulf(A, 1/square_norm) : A;
}
function is_nullsy(value/*: any*/)/*: value is null | undefined*/ {
  return value == null;
}
function is_array/*<V>*/(value/*: any*/)/*: value is V[]*/ {
  return Array.isArray(value);
}
function is_object/*<V>*/(value/*: any*/)/*: value is Record<string, V>*/ {
  return value !== null && typeof value === "object";
}
function is_string(value/*: any*/)/*: value is string*/ {
  return typeof value === "string";
}
function is_number(value/*: any*/)/*: value is number*/ {
  return typeof value === "number";
}
function is_boolean(value/*: any*/)/*: value is boolean*/ {
  return typeof value === "boolean";
}
function is_function(value/*: any*/)/*: value is Function*/ {
  return typeof value === "function";
}
function is_symbol(value/*: any*/)/*: value is Symbol*/ {
  return typeof value === "symbol";
}
function is_bigint(value/*: any*/)/*: value is BigInt*/ {
  return typeof value === "bigint";
}
/** clamp value between min and max (defaulting to min) */
function clamp(value/*: number*/, min/*: number*/, max/*: number*/)/*: number*/ {
  return Math.max(min, Math.min(value, max));
}
function lerp(t/*: number*/, x/*: number*/, y/*: number*/)/*: number*/ {
  return (1-t)*x + t*y;
}
function unlerp(value/*: number*/, x/*: number*/, y/*: number*/)/*: number*/ {
  return (x - value) / (x - y);
}

// modulo
/** return `a` remainder `b` */
function rem(a/*: number*/, b/*: number*/)/*: number*/ {
  return a % b;
}
/** return `a` modulo `b` */
function mod(a/*: number*/, b/*: number*/)/*: number*/ {
  return ((a % b) + b) % b;
}

// noise
const PHI_1_INV = 0.6180339887498948;
/** map `seed` to noise, such that `noise(0) == 0`  */
function noise(seed/*: number*/)/*: number*/ {
  return mod(seed * PHI_1_INV, 1);
}

// directed rounding
function round_directed_towards_infinity(value/*: number*/) {
  return Math.ceil(value);
}
function round_directed_towards_negative_infinity(value/*: number*/) {
  return Math.floor(value);
}
function round_directed_towards_zero(value/*: number*/) {
  return Math.trunc(value);
}
function round_directed_away_from_zero(value/*: number*/) {
  return value > 0 ? Math.ceil(value) : Math.floor(value);
}

// nearest rounding
function round_towards_infinity(value/*: number*/) {
  return Math.floor(value + 0.5);
}
function round_towards_negative_infinity(value/*: number*/) {
  return Math.ceil(value - 0.5);
}
function round_towards_zero(value/*: number*/) {
  return value > 0 ? Math.ceil(value - 0.5) : Math.floor(value + 0.5);
}
function round_away_from_zero(value/*: number*/) {
  return value > 0 ? Math.floor(value + 0.5) : Math.ceil(value - 0.5);
}
function round_to_even(value/*: number*/) {
  let result = round_towards_infinity(value);
  const is_tie = (Math.abs(value) % 1 === 0.5);
  const result_is_odd = (result % 2 !== 0);
  if (is_tie && result_is_odd) result -= 1;
  return result;
}
function round_to_odd(value/*: number*/) {
  let result = round_towards_infinity(value);
  const is_tie = (Math.abs(value) % 1 === 0.5);
  const result_is_even = (result % 2 === 0);
  if (is_tie && result_is_even) result -= 1;
  return result;
}
function makeArray/*<T>*/(N/*: number*/, map/*: (v: undefined, i: number) => T*/)/*: T[]*/ {
	const arr = Array(N);
	for (let i = 0; i < arr.length; i++) {
		arr[i] = map(undefined, i);
	}
	return arr;
}
function asArray/*<T>*/(valueOrArrayOrNullsy/*: T | T[] | undefined | null*/)/*: T[]*/ {
	if (is_array(valueOrArrayOrNullsy)) return valueOrArrayOrNullsy;
	return valueOrArrayOrNullsy == null ? [] : [valueOrArrayOrNullsy];
}

// group
/*type Group<T> = {
	groupId: string;
	items: T[];
}
*/function groupBy/*<T>*/(items/*: T[]*/, key/*: (v: T) => string*/)/*: Group<T>[]*/ {
	const groups = {} /*as Record<string, T[]>*/;
	for (let item of items) {
		const item_key = key(item);
		const groupItems = groups[item_key /*as string*/] ?? [];
		groupItems.push(item);
		groups[item_key /*as string*/] = groupItems;
	}
	return Object.entries(groups).map(([groupId, groupItems]) => ({groupId: groupId, items: groupItems}));
}

// sort
/*type Comparable = number | string | Date | BigInt | undefined | null*/;
function compare(a/*: any*/, b/*: any*/)/*: number*/ {
	return ((a > b) /*as unknown*/ /*as number*/) - ((a < b) /*as unknown*/ /*as number*/);
}
function sortBy/*<T, K extends Comparable>*/(arr/*: T[]*/, key/*: (v: T) => K*/, descending = false)/*: T[]*/ {
	return arr.sort((a, b) => {
		let comparison = compare(key(a), key(b));
		if (descending) {comparison = -comparison;}
		return comparison;
	});
}
function sortByArray/*<T, K extends Comparable>*/(arr/*: T[]*/, key/*: (v: T) => K[]*/, descending/*: boolean[]*/ = [])/*: T[]*/ {
	return arr.sort((a, b) => {
		const a_key = key(a);
		const b_key = key(b);
		const n = Math.max(a_key.length, b_key.length);
		for (let i = 0; i < n; i++) {
			let comparison = compare(a_key[i], b_key[i]);
			if (descending[i]) {comparison = -comparison;}
			if (comparison !== 0) return comparison;
		}
		return 0;
	});
}
function camelCaseToKebabCase(key/*: string*/) {
  return (key.match(/[A-Z][a-z]*|[a-z]+/g) ?? []).map(v => v.toLowerCase()).join("-");
}
function removePrefix(value/*: string*/, prefix/*: string*/)/*: string*/ {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}
function removeSuffix(value/*: string*/, prefix/*: string*/)/*: string*/ {
  return value.endsWith(prefix) ? value.slice(value.length - prefix.length) : value;
}

// css
function rgbFromHexString(hexString/*: string*/)/*: string*/ {
  let hexString2 = removePrefix(hexString.trim(), '#');
  return `${parseInt(hexString2.slice(0, 2), 16)}, ${parseInt(hexString2.slice(2, 4), 16)}, ${parseInt(hexString2.slice(4, 6), 16)}`;
}
function addPx(pixelsOrString/*: string | number*/) {
  return is_number(pixelsOrString) ? `${pixelsOrString}px` : pixelsOrString /*as string*/;
}
function addPercent(fractionOrString/*: string | number*/) {
  return is_number(fractionOrString) ? `${(fractionOrString * 100).toFixed(2)}%` : fractionOrString /*as string*/;
}

/** Return stringified JSON with extra undefineds for printing */
function stringifyJs(v/*: any*/)/*: string*/ {
  if (v === undefined) return "undefined";
  return JSON.stringify(v); // TODO: also handle nested undefineds
}

// json
function stringifyJson(v/*: any*/)/*: string*/ {
  return JSON.stringify(v);
}
function parseJson(v/*: string*/)/*: any*/ {
  return JSON.parse(v);
}
/** Return stringified JSON with object keys and arrays sorted */
function stringifyJsonStable(data/*: Record<string, any>*/)/*: string*/ {
  const replacer = (_key/*: string*/, value/*: any*/) =>
    value instanceof Object
      ? value instanceof Array
        ? [...value].sort()
        : Object.keys(value)
            .sort()
            .reduce((sorted/*: Record<string, any>*/, key) => {
              sorted[key] = value[key];
              return sorted;
            }, {})
      : value;
  return JSON.stringify(data, replacer);
}

// path
/*export type PathParts = {
  origin?: string;
  pathname?: string;
  query?: string | Record<string, string>;
  hash?: string;
}*/;
/** Make path `${origin}${pathname}?${queryString}#{hash}` and normalize to no trailing `"/"` */
function makePath(parts/*: string | PathParts*/)/*: string*/ {
  if (is_string(parts)) {return parts}
  let origin = parts.origin ?? window.location.origin;
  let pathname = parts.pathname ?? window.location.pathname;
  let query = parts.query ?? window.location.search;
  let hash = parts.hash ?? window.location.hash;
  // build path
  let pathLocation = (origin ?? "") + (pathname ?? "");
  if (pathLocation.endsWith("/index.html")) pathLocation = pathLocation.slice(0, -10);
  pathLocation = pathLocation.replace(/(\/*$)/g, "") || "/";
  let queryString = '';
  if (is_string(query)) {
    queryString = query;
  } else if (Object.keys(query ?? {}).length) {
    const queryObject = query /*as any*/;
    queryString = `?${Object.entries(queryObject).map(([k, v]) => `${k}=${v}`).join("&")}`;
  }
  let hashString = hash ?? "";
  if (hashString && !hashString.startsWith("#")) hashString = "#" + hashString;
  return pathLocation + queryString + hashString;
}

// search
/** return `patternMask` for bitap_search() */
function bitap_pattern_mask(pattern/*: string*/)/*: Record<string, number>*/ {
  if (pattern.length > 31) throw new Error("Pattern too long! Bitap supports patterns up to 31 characters.");
  const patternMask/*: Record<string, number>*/ = {};
  for (let i = 0; i < pattern.length; i++) {
    patternMask[pattern[i]] = (patternMask[pattern[i]] || ~0) & ~(1 << i);
  }
  return patternMask;
}
/** Usage:
 * ```ts
 * const patternMask = bitap_pattern_mask(pattern);
 * bitap_search(text1, pattern.length, patternMask);
 * bitap_search(text2, pattern.length, patternMask);
 * ```
 *
 * return `[index_of_pattern_in_text, number_of_edits]` (up to 1 add/replace/delete), return `[-1, -1]` if not found */
function bitap_search(text/*: string*/, patternLength/*: number*/, patternMask/*: Record<string, number>*/)/*: [number, number]*/ {
  if (patternLength === 0) return [0, 0];

  let R_0 = ~1;
  let R_1 = ~1;
  let best_match_i = -1;
  for (let i = 0; i < text.length; i++) {
    let oldPrevR = R_0;
    R_0 |= (patternMask[text[i]] || ~0);
    R_0 <<= 1;

    /* allow 1 edit */
    //tmp = R_1
    const match = (R_1 | (patternMask[text[i]] || ~0));
    const replace = oldPrevR;
    const add_or_delete = oldPrevR << 1;
    R_1 = match & replace & add_or_delete;
    R_1 <<= 1;
    //oldPrevR = tmp;

    if ((R_0 & (1 << patternLength)) === 0) {
      return [i, 0];
    } else if ((R_1 & (1 << patternLength)) === 0) {
      best_match_i = i;
    }
  }

  return best_match_i == -1 ? [-1, -1] : [best_match_i, 1];
}
function search_options(pattern/*: string*/, options/*: string[]*/)/*: string[]*/ {
  if (pattern.length === 0) return options;
  const patternMask = bitap_pattern_mask(pattern);

  /*type SearchInfo = {
    option: string;
    index: number;
    editCount: number;
  }*/;
  const infos/*: SearchInfo[]*/ = [];
  for (let option of options) {
    let index, editCount = 0;
    if (pattern.length > 31) {
      index = option.indexOf(pattern);
    } else {
      [index, editCount] = bitap_search(option, pattern.length, patternMask);
    }
    if (index !== -1) {
      infos.push({option, index, editCount});
    }
  }

  return sortByArray(infos, v => [v.editCount, v.index]).map(v => v.option);
}
export const JSGUI_VERSION = "v0.21";
function parseJsonOrNull(jsonString/*: string*/)/*: JSONValue*/ {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}
/*export type Nullsy = undefined | null*/;
/*export type StringMap<T = any> = Record<string, T>*/;
/*export type JSONValue = string | number | any[] | StringMap | null*/;
/*export type ParentNodeType = HTMLElement | SVGSVGElement*/;
/*export type NodeType = ParentNodeType | Text*/;
/*export type EventWithTarget<T = Event, E = HTMLInputElement> = T & {target: E}*/;
/*export type InputEventWithTarget = EventWithTarget<InputEvent>*/;
/*export type ChangeEventWithTarget = EventWithTarget<Event>*/;
/*export type _EventListener<T = Event> = ((event: T) => void)*/;
/*export type EventsMap = {
  // NOTE: Safari iOS and Chrome android don't support onclick - use onpointerup instead
  // NOTE: mouseXX and touchXX events are platform-specific, so they shouldn't be used
  touchstart?: _EventListener<TouchEvent> | null; // NOTE: if you want to prevent drag to scroll on mobile, you need to call .preventDefault() on this event specifically..

  pointerenter?: _EventListener<PointerEvent> | null; // same as pointerover?
  pointerleave?: _EventListener<PointerEvent> | null; // same as pointerout?
  pointerdown?: _EventListener<PointerEvent> | null;
  pointermove?: _EventListener<PointerEvent> | null;
  pointercancel?: _EventListener<PointerEvent> | null;
  pointerup?: _EventListener<PointerEvent> | null;

  focus?: _EventListener<FocusEvent> | null;
  blur?: _EventListener<FocusEvent> | null;
  focusin?: _EventListener<FocusEvent> | null;
  focusout?: _EventListener<FocusEvent> | null;

  keydown?: _EventListener<KeyboardEvent> | null;
  keypress?: _EventListener<KeyboardEvent> | null;
  keyup?: _EventListener<KeyboardEvent> | null;

  scroll?: _EventListener<WheelEvent> | null;

  beforeinput?: _EventListener<InputEventWithTarget> | null;
  input?: _EventListener<InputEventWithTarget> | null;

  compositionstart?: _EventListener<CompositionEvent> | null;
  compositionend?: _EventListener<CompositionEvent> | null;
  compositionupdate?: _EventListener<CompositionEvent> | null;

  paste?: _EventListener<ClipboardEvent> | null;
}*/;
/*export type UndoPartial<T> = T extends Partial<infer R> ? R : T*/;
/*export type Diff<T> = {
  key: string;
  oldValue: T;
  newValue: T;
}*/;
function getDiff/*<T>*/(oldValue/*: StringMap<T>*/, newValue/*: StringMap<T>*/)/*: Diff<T>[]*/ {
  const diffMap/*: StringMap<Partial<Diff<T>>>*/ = {};
  for (let [k, v] of Object.entries(oldValue)) {
    let d = diffMap[k] ?? {key: k};
    d.oldValue = v;
    diffMap[k] = d;
  }
  for (let [k, v] of Object.entries(newValue)) {
    let d = diffMap[k] ?? {key: k};
    d.newValue = v;
    diffMap[k] = d;
  }
  return (Object.values(diffMap) /*as Diff<T>[]*/).filter(v => v.newValue !== v.oldValue);
}
function getDiffArray(oldValues/*: string[]*/, newValues/*: string[]*/)/*: Diff<string>[]*/ {
  const diffMap/*: StringMap<Partial<Diff<string>>>*/ = {};
  for (let k of oldValues) {
    let d = diffMap[k] ?? {key: k};
    d.oldValue = k;
    diffMap[k] = d;
  }
  for (let k of newValues) {
    let d = diffMap[k] ?? {key: k};
    d.newValue = k;
    diffMap[k] = d;
  }
  return (Object.values(diffMap) /*as Diff<string>[]*/).filter(v => v.newValue !== v.oldValue);
}

// NOTE: tsc is stupid and removes comments before types
/*export type ComponentFunction<T extends any[]> = (...argsOrProps: T) => Component*/;
/*export type ComponentOptions = {
  name: string;
}*/;
/*export type BaseProps = {
  key?: string | number;
  attribute?: StringMap<string | number | boolean>;
  cssVars?: StringMap<string | number | undefined>;
  className?: string | string[];
  style?: StringMap<string | number | undefined>;
  events?: EventsMap;
}*/;
/*export type RenderedBaseProps = UndoPartial<Omit<BaseProps, "key" | "className">> & {key?: string, className: string[]}*/;
/*export type RenderReturn = void | {
  onMount?: () => void,
  onUnmount?: (removed: boolean) => void,
}*/;
/*export type RenderFunction<T extends any[]> = (this: Component, ...argsOrProps: T) => RenderReturn*/;
/*export type SetState<T, IsPartial = true> = (newValue: IsPartial extends true ? Partial<T> : T) => T*/;
/*export type UseNodeState = {nodeDependOn?: any}*/;
/*export type GetErrorsFunction<K extends string> = (errors: Partial<Record<K, string>>) => void*/;
/*export type UseWindowResize = { windowBottom: number, windowRight: number }*/;
// component
function _setDefaultChildKey(component/*: Component*/, child/*: Component*/) {
  const name = child.name;
  let key = child.baseProps.key;
  if (key == null) {
    if (name === "text") {
      key = `auto_${component.indexedTextCount++}_text`;
    } else {
      key = `auto_${component.indexedChildCount++}_${name}`;
    }
  }
  child.key = key;
}
function DEFAULT_STATE_UPDATER/*<T extends object>*/(diff/*: Partial<T>*/, prevState/*: T | undefined*/) {
  return {...prevState, ...diff} /*as T*/;
}
class Component {
  // props
  name/*: string*/;
  args/*: any[]*/;
  baseProps/*: RenderedBaseProps*/;
  props/*: StringMap*/;
  children/*: Component[]*/;
  onRender/*: RenderFunction<any[]>*/;
  options/*: ComponentOptions*/;
  // metadata
  _/*: ComponentMetadata | RootComponentMetadata*/;
  key/*: string*/;
  // hooks
  node/*: NodeType | null*/;
  indexedChildCount/*: number*/;
  indexedTextCount/*: number*/;
  constructor(onRender/*: RenderFunction<any[]>*/, args/*: any[]*/, baseProps/*: RenderedBaseProps*/, props/*: StringMap*/, options/*: ComponentOptions*/) {
    this.name = options.name ?? onRender.name;
    if (!this.name && (options.name !== "")) throw `Function name cannot be empty: ${onRender}`;
    this.args = args
    this.baseProps = baseProps;
    this.props = props;
    this.children = [];
    this.onRender = onRender;
    this.options = options;
    // metadata
    this._ = null /*as any*/;
    this.key = "";
    // hooks
    this.node = null;
    this.indexedChildCount = 0;
    this.indexedTextCount = 0;
  }
  useNode/*<T extends NodeType>*/(getNode/*: () => T*/, nodeDependOn/*?: any*/)/*: T*/ {
    const [state] = this.useState/*<UseNodeState>*/({});
    let node = this.getNode();
    if (state.nodeDependOn !== nodeDependOn) {
      node = getNode();
      state.nodeDependOn = nodeDependOn;
    } else if (node == null) {
      node = getNode();
    }
    return (this.node = node) /*as T*/;
  }
  getNode()/*: NodeType | null*/ {
    return this._.prevNode;
  }
  append(childOrString/*: string | Component*/)/*: Component*/ {
    const child = (childOrString instanceof Component) ? childOrString : text(childOrString);
    this.children.push(child);
    return child;
  }
  /** `return [value, setStateAndRerender, setValue]` */
  useState/*<T extends object>*/(defaultStateOrUpdater/*: T | ((diff: Partial<T>, prevState: T | undefined) => T)*/)/*: [T, SetState<T>, SetState<T>]*/ {
    const {_} = this;
    const userInputIsUpdater = typeof defaultStateOrUpdater === "function";
    const updater = userInputIsUpdater ? defaultStateOrUpdater : DEFAULT_STATE_UPDATER;
    if (_.state === undefined) {
      const defaultState = userInputIsUpdater ? {} : defaultStateOrUpdater;
      _.state = updater(defaultState, undefined);
    }
    const setState = (newValue/*: Partial<T>*/) => {
      const newState = updater(newValue, _.state /*as T*/);
      _.state = newState;
      return newState;
    };
    const setStateAndRerender = (newValue/*: Partial<T>*/) => {
      const newState = setState(newValue);
      this.rerender();
      return newState;
    }
    return [_.state /*as T*/, setStateAndRerender, setState];
  }
  useValidate/*<K extends string>*/(getErrors/*: GetErrorsFunction<K>*/) {
    return () => {
      let errors/*: Partial<Record<K, string>>*/ = {};
      getErrors(errors);
      const state = this._.state /*as StringMap*/;
      state.errors = errors;
      state.didValidate = true;
      const hasErrors = Object.keys(errors).length > 0;
      if (hasErrors) {
        this.rerender();
      }
      return !hasErrors;
    }
  }
  // dispatch
  useMedia(mediaQuery/*: StringMap<string | number>*/) { // TODO: add types
    const key = Object.entries(mediaQuery).map(([k, v]) => `(${camelCaseToKebabCase(k)}: ${addPx(v)})`).join(' and ');
    const dispatchTarget = _dispatchTargets.media.addDispatchTarget(key);
    dispatchTarget.addComponent(this);
    return dispatchTarget.state.matches; // TODO: this forces recalculate style (4.69 ms), cache value so this doesn't happen?
  }
  /** `return [value, setValueAndDispatch, setValue]` */
  useLocalStorage/*<T>*/(key/*: string*/, defaultValue/*: T*/)/*: [T, SetState<T, false>, SetState<T, false>]*/ {
    _dispatchTargets.localStorage.addComponent(this);
    const value = (parseJsonOrNull(localStorage[key]) /*as [T] | null*/)?.[0] ?? defaultValue;
    const setValue = (newValue/*: T*/) => {
      localStorage.setItem(key, JSON.stringify([newValue]));
      return newValue;
    }
    const setValueAndDispatch = (newValue/*: T*/) => {
      const prevValue = localStorage[key];
      setValue(newValue);
      if (JSON.stringify([newValue]) !== prevValue) {
        _dispatchTargets.localStorage.dispatch();
        this.rerender();
      }
      return newValue;
    }
    return [value, setValueAndDispatch, setValue];
  }
  useLocation()/*: PathParts*/ {
    _dispatchTargets.location.addComponent(this);
    return {}; // TODO: useLocation()
  }
  useLocationHash()/*: string*/ {
    _dispatchTargets.locationHash.addComponent(this);
    return window.location.hash;
  }
  useWindowResize()/*: UseWindowResize*/ {
    _dispatchTargets.windowResize.addComponent(this);
    return { windowBottom: window.innerHeight, windowRight: window.innerWidth };
  }
  rerender() {
    const root_ = this._.root;
    const rootComponent = root_.component;
    const newGcFlag = !root_.gcFlag;
    if (!root_.willRerenderNextFrame) {
      root_.willRerenderNextFrame = true;
      requestAnimationFrame(() => {
        const newRootComponent = _copyComponent(rootComponent);
        newRootComponent._ = root_;
        root_.gcFlag = newGcFlag;
        root_.component = newRootComponent;
        _render(newRootComponent, root_.parentNode);
        _unloadUnusedComponents(rootComponent, newGcFlag);
        root_.willRerenderNextFrame = false;
      });
    }
  }
  _findByName(name/*: string*/)/*: Component | undefined*/ {
    if (this.name === name) return this;
    return this.children.map(v => v._findByName(name)).filter(v => v)[0];
  }
  _logByName(name/*: string*/) {
    const component = this._findByName(name);
    console.log({ ...component, _: { ...component?._ } });
  }
}
export function makeComponent/*<A extends Parameters<any>>*/(name/*: string*/, onRender/*: RenderFunction<A>*/, extra/*: Omit<ComponentOptions, 'name'>*/ = {})/*: ComponentFunction<A>*/ {
  if (typeof name === "function") {
    console.warn(`makeComponent(function name(){}) is deprecated, since js bundlers mess up the names...\nPrefer makeComponent("name", function(){})`);
    const legacy_onRender = name /*as RenderFunction<A>*/;
    const legacy_options = onRender /*as ComponentOptions | undefined*/;
    name = legacy_options?.name ?? legacy_onRender.name;
    onRender = legacy_onRender;
  }
  const options/*: ComponentOptions*/ = {...extra, name};
  return (...argsOrProps/*: any[]*/) => {
    const argCount = (onRender+"").split("{")[0].split(",").length; // NOTE: allow multiple default arguments
    const args = new Array(argCount).fill(undefined);
    for (let i = 0; i < argsOrProps.length; i++) {
      args[i] = argsOrProps[i];
    }
    const propsAndBaseProps = (argsOrProps[argCount - 1] ?? {}) /*as BaseProps & StringMap*/;
    const {key, style = {}, attribute = {}, className: className, cssVars = {}, events = {} /*as EventsMap*/, ...props} = propsAndBaseProps;
    if (('key' in propsAndBaseProps) && ((key == null) || (key === ""))) {
      const name = options.name;
      console.warn(`${name} component was passed ${stringifyJs(key)}, did you mean to pass a string?`)
    }
    const baseProps/*: RenderedBaseProps*/ = {
      key: (key != null) ? String(key) : undefined,
      style,
      attribute,
      className: Array.isArray(className) ? className : (className ?? "").split(" ").filter(v => v),
      cssVars,
      events,
    };
    return new Component(onRender, args, baseProps, props, options);
  }
}
export const text = makeComponent("text", function(str/*: string*/, _props/*: {}*/ = {}) {
  const [state] = this.useState({prevStr: ""});
  const textNode = this.useNode(() => new Text(""));
  if (str !== state.prevStr) {
    state.prevStr = str;
    textNode.textContent = str;
  }
});
function _copyComponent(component/*: Component*/) {
  const newComponent = new Component(component.onRender, component.args, component.baseProps, component.props, component.options);
  newComponent._ = component._;
  return newComponent;
}

// TODO: remove this whole mess, and just always rerender the whole tree
/*export type DispatchTargetAddListeners = (dispatch: () => void) => any*/;
// dispatch
class DispatchTarget {
  components/*: Component[]*/;
  state/*: any*/;
  constructor(addListeners/*: DispatchTargetAddListeners*/ = () => {}) {
    this.components = [];
    this.state = addListeners(() => this.dispatch());
  }
  addComponent(component/*: Component*/) {
    this.components.push(component);
  }
  removeComponent(component/*: Component*/) {
    const i = this.components.indexOf(component);
    if (i !== -1) this.components.splice(i, 1);
  }
  dispatch() {
    for (let component of this.components) {
      component.rerender();
    }
  }
}
class DispatchTargetMap {
  data/*: StringMap<DispatchTarget>*/;
  addListeners/*: (key: string) => DispatchTargetAddListeners*/;
  constructor(addListeners/*: (key: string) => DispatchTargetAddListeners*/) {
    this.data = {};
    this.addListeners = addListeners;
  }
  addDispatchTarget(key/*: string*/) {
    const {data, addListeners} = this;
    const oldDT = data[key];
    if (oldDT != null) return oldDT;
    const newDT = new DispatchTarget(addListeners(key));
    data[key] = newDT;
    return newDT;
  }
  removeComponent(component/*: Component*/) {
    for (let key in this.data) {
      this.data[key].removeComponent(component);
    }
  }
}
/*export type AddDispatchTarget = {
  map: StringMap<DispatchTarget>;
  key: string;
  addListeners: DispatchTargetAddListeners;
}*/;
export const _dispatchTargets = {
  media: new DispatchTargetMap((key) => (dispatch) => {
    const mediaQueryList = window.matchMedia(key);
    mediaQueryList.addEventListener("change", dispatch);
    return mediaQueryList;
  }),
  localStorage: new DispatchTarget((dispatch) => window.addEventListener("storage", dispatch)),
  location: new DispatchTarget((_dispatch) => {}),
  locationHash: new DispatchTarget((dispatch) => {
    window.addEventListener("hashchange", () => {
      _scrollToLocationHash();
      dispatch();
    });
  }),
  windowResize: new DispatchTarget((dispatch) => window.addEventListener("resize", dispatch)),
  /*mouseMove: new DispatchTarget((dispatch) => {
    const state = {x: -1, y: -1};
    window.addEventListener("mousemove", (event) => {
      state.x = event.clientX;
      state.y = event.clientY;
      dispatch();
    });
    return state;
  }),*/
  removeComponent(component/*: Component*/) {
    _dispatchTargets.media.removeComponent(component);
    _dispatchTargets.localStorage.removeComponent(component);
    _dispatchTargets.location.removeComponent(component);
    _dispatchTargets.locationHash.removeComponent(component);
    _dispatchTargets.windowResize.removeComponent(component);
  },
}
function _scrollToLocationHash() {
  const element = document.getElementById(location.hash.slice(1));
  if (element) element.scrollIntoView();
}
/*export type NavigateFunction = (parts: string | PathParts) => void*/;
export const NavType = {
  Add: "Add",
  Replace: "Replace",
  AddAndReload: "AddAndReload",
  ReplaceAndReload: "ReplaceAndReload",
  OpenInNewTab: "OpenInNewTab",
};
function navigate(urlOrParts/*: string | PathParts*/, navType/*: NavType*/ = NavType.Add) {
  const newPath = makePath(urlOrParts);
  switch (navType) {
  case "Add":
  case "Replace":
    {
      const isExternalLink = !newPath.startsWith("/") && !newPath.startsWith(window.location.origin);
      if (isExternalLink) {navType = NavType.AddAndReload}
    }
  }
  switch (navType) {
  case "Add":
    history.pushState(null, "", newPath)
    _dispatchTargets.location.dispatch();
    break;
  case "Replace":
    history.replaceState(null, "", newPath)
    _dispatchTargets.location.dispatch();
    break;
  case "AddAndReload":
    location.href = newPath;
    break;
  case "ReplaceAndReload":
    location.replace(newPath);
    break;
  case "OpenInNewTab":
    window.open(newPath);
    break;
  }
}

// metadata
class ComponentMetadata {
  // state
  state/*: StringMap | undefined*/;
  prevState/*: any | null*/ = null;
  prevNode/*: NodeType | null*/ = null;
  prevBaseProps/*: InheritedBaseProps*/ = _START_BASE_PROPS;
  prevEvents/*: EventsMap*/ = {} /*as EventsMap*/;
  gcFlag/*: boolean*/ = false;
  onUnmount/*?: (removed: boolean) => void*/;
  // navigation
  prevBeforeNode/*: NodeType | null*/ = null;
  prevComponent/*: Component | null*/ = null;
  keyToChild/*: StringMap<ComponentMetadata>*/ = {};
  parent/*: ComponentMetadata | RootComponentMetadata | null*/;
  root/*: RootComponentMetadata*/;
  // debug
  prevIndexedChildCount/*: number | null*/ = null;
  constructor(parent/*: ComponentMetadata | RootComponentMetadata | null*/) {
    this.parent = parent;
    this.root = parent?.root ?? null /*as any*/;
  }
}
class RootComponentMetadata extends ComponentMetadata {
  component/*: Component*/;
  parentNode/*: ParentNodeType*/;
  willRerenderNextFrame/*: boolean*/ = false;
  constructor(component/*: Component*/, parentNode/*: ParentNodeType*/) {
    super(null);
    this.root = this;
    this.component = component;
    this.parentNode = parentNode;
  }
}

// render
export let SCROLLBAR_WIDTH = 0;
export let THIN_SCROLLBAR_WIDTH = 0;
function _computeScrollbarWidth() {
  let e = document.createElement("div");
  e.style.cssText = "overflow:scroll; visibility:hidden; position:absolute;";
  document.body.append(e);
  SCROLLBAR_WIDTH = e.offsetWidth - e.clientWidth;
  e.style.scrollbarWidth = "thin";
  THIN_SCROLLBAR_WIDTH = e.offsetWidth - e.clientWidth;
  e.remove();
  document.body.style.setProperty("--scrollbarWidth", addPx(SCROLLBAR_WIDTH));
  document.body.style.setProperty("--thinScrollbarWidth", addPx(THIN_SCROLLBAR_WIDTH));
}
export function renderRoot(rootComponent/*: Component*/, parentNode/*: ParentNodeType | null*/ = null)/*: RootComponentMetadata*/ {
  const root_ = new RootComponentMetadata(rootComponent, parentNode /*as any*/);
  rootComponent._ = root_;
  const render = () => {
    root_.parentNode = root_.parentNode ?? document.body;
    if (SCROLLBAR_WIDTH === 0) _computeScrollbarWidth();
    _render(rootComponent, root_.parentNode);
    requestAnimationFrame(() => {
      _scrollToLocationHash();
    });
  }
  if (root_.parentNode ?? document.body) {
    render();
  } else {
    window.addEventListener("load", render);
  }
  return root_;
}
/*export type InheritedBaseProps = UndoPartial<Omit<BaseProps, "key" | "events">> & {className: string[]}*/;
export const _START_BASE_PROPS/*: InheritedBaseProps*/ = {
  attribute: {},
  className: [],
  cssVars: {},
  style: {},
};
// TODO: make this non-recursive for cleaner console errors
function _render(component/*: Component*/, parentNode/*: ParentNodeType*/, beforeNodeStack/*: (NodeType | null)[]*/ = [], _inheritedBaseProps/*: InheritedBaseProps*/ = _START_BASE_PROPS, isTopNode = true) {
  // render elements
  const {_, name, args, baseProps, props, onRender} = component;
  const {onMount, onUnmount} = onRender.bind(component)(...args, props) ?? {};
  const {node, children, indexedChildCount} = component; // NOTE: get after render
  const prevIndexedChildCount = _.prevIndexedChildCount;
  // inherit
  let inheritedBaseProps = {
    attribute: {..._inheritedBaseProps.attribute, ...baseProps.attribute},
    className: [..._inheritedBaseProps.className, ...baseProps.className],
    cssVars: {..._inheritedBaseProps.cssVars, ...baseProps.cssVars},
    style: {..._inheritedBaseProps.style, ...baseProps.style},
  };
  const prevNode = _.prevNode;
  const beforeNode = beforeNodeStack[beforeNodeStack.length - 1];
  if (node) {
    // append
    if (beforeNode && (beforeNode !== _.prevBeforeNode)) {
      beforeNode.after(node);
    } else if (!prevNode) {
      parentNode.prepend(node); // NOTE: prepend if no history
    }
    _.prevBeforeNode = beforeNode;
    if (node != prevNode) {
      if (prevNode) prevNode.remove();
      _.prevBaseProps = _START_BASE_PROPS;
      _.prevEvents = {} /*as EventsMap*/;
    }
    if (!(node instanceof Text)) {
      // style
      const styleDiff = getDiff(_.prevBaseProps.style, inheritedBaseProps.style);
      for (let {key, newValue} of styleDiff) {
        if (newValue != null) {
          node.style[key /*as any*/] = addPx(newValue);
        } else {
          node.style.removeProperty(key);
        }
      }
      // cssVars
      const cssVarsDiff = getDiff(_.prevBaseProps.cssVars, inheritedBaseProps.cssVars);
      for (let {key, newValue} of cssVarsDiff) {
        if (newValue != null) {
          node.style.setProperty(`--${key}`, addPx(newValue));
        } else {
          node.style.removeProperty(`--${key}`);
        }
      }
      // class
      if (name !== node.tagName.toLowerCase()) {
        inheritedBaseProps.className.push(camelCaseToKebabCase(name));
      };
      const classNameDiff = getDiffArray(_.prevBaseProps.className, inheritedBaseProps.className);
      for (let {key, newValue} of classNameDiff) {
        if (newValue != null) {
          if (key === "") console.warn("className cannot be empty,", name, inheritedBaseProps.className);
          if (key.includes(" ")) console.warn("className cannot contain whitespace,", name, inheritedBaseProps.className);
          node.classList.add(key);
        } else {
          node.classList.remove(key);
        }
      }
      // attribute
      const attributeDiff = getDiff(_.prevBaseProps.attribute, inheritedBaseProps.attribute);
      for (let {key, newValue} of attributeDiff) {
        if (newValue != null) {
          node.setAttribute(camelCaseToKebabCase(key), String(newValue));
        } else {
          node.removeAttribute(camelCaseToKebabCase(key));
        }
      }
      // events
      const eventsDiff = getDiff(_.prevEvents, baseProps.events ?? {});
      for (let {key, oldValue, newValue} of eventsDiff) {
        node.removeEventListener(key, oldValue /*as _EventListener*/);
        if (newValue) {
          const passive = key === "scroll" || key === "wheel";
          node.addEventListener(key, newValue /*as _EventListener*/, {passive});
        }
      }
      _.prevBaseProps = inheritedBaseProps;
      _.prevEvents = baseProps.events ?? {};
      parentNode = node;
      inheritedBaseProps = _START_BASE_PROPS;
      isTopNode = false;
    }
  } else {
    if (prevNode) {
      prevNode.remove(); // NOTE: removing components is handled by _unloadUnusedComponents()
      _.prevBaseProps = {} /*as InheritedBaseProps*/;
      _.prevEvents = {} /*as EventsMap*/;
    }
    if (name) inheritedBaseProps.className.push(camelCaseToKebabCase(name)); // NOTE: fragment has name: ''
  }
  // children
  const usedKeys = new Set();
  if (node) beforeNodeStack.push(null);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    _setDefaultChildKey(component, child);
    const key = child.key;
    if (usedKeys.has(key)) console.warn(`Duplicate key: '${key}'`, component);
    usedKeys.add(key);
    const child_ = _.keyToChild[key] ?? new ComponentMetadata(_);
    _.keyToChild[key] = child_;
    child._ = child_;
    child_.gcFlag = _.gcFlag;
    _render(child, parentNode, beforeNodeStack, inheritedBaseProps, isTopNode);
  }
  if (node) {
    beforeNodeStack.pop();
    beforeNodeStack[beforeNodeStack.length - 1] = node;
  }
  // on mount
  _.prevNode = node;
  _.prevIndexedChildCount = indexedChildCount;
  _.prevState = {..._.state};
  const prevComponent = _.prevComponent;
  _.prevComponent = component;
  const prevOnOnmount = _.onUnmount;
  if (prevOnOnmount) prevOnOnmount(false);
  if (onMount) onMount();
  if (onUnmount) _.onUnmount = onUnmount;
  // warn if missing keys
  if (prevIndexedChildCount !== null && (indexedChildCount !== prevIndexedChildCount)) {
    console.warn(`Newly added/removed children should have a "key" prop. (${prevIndexedChildCount} -> ${indexedChildCount})`, prevComponent, component);
  }
}

// rerender
function _unloadUnusedComponents(prevComponent/*: Component*/, rootGcFlag/*: boolean*/) {
  for (let child of prevComponent.children) {
    const {gcFlag, parent, onUnmount, prevNode} = child._;
    if (gcFlag !== rootGcFlag) {
      _dispatchTargets.removeComponent(prevComponent);
      delete parent?.keyToChild[child.key];
      if (onUnmount) onUnmount(true);
      if (prevNode) prevNode.remove();
    }
    _unloadUnusedComponents(child, rootGcFlag);
  }
}
function moveRoot(root_/*: RootComponentMetadata*/, parentNode/*: ParentNodeType*/) {
  root_.parentNode = parentNode;
  if (root_.prevNode) parentNode.append(root_.prevNode);
}
function unloadRoot(root_/*: RootComponentMetadata*/) {
  _unloadUnusedComponents(root_.component, !root_.gcFlag);
}

// sizes
export const Size = {
  small:  "small",
  normal: "normal",
  big:    "big",
  bigger: "bigger",
};
// default colors
export const BASE_COLORS = {
  gray: "0.0, 0.85, 0, 0",
  secondary: "0.85, 0.45, 0.127, 250",
  red: "0.45, 0.85, 0.127, 25",
  //yellow: "0.45, 0.85, 0.127, 95", // TODO: yellow, green
  //green: "0.45, 0.85, 0.127, 145",
};
/*export type BaseColor = keyof typeof*/ BASE_COLORS; // TODO: remove this?
export const COLOR_SHADE_COUNT = 7;

/*
TODO: documentation
  renderRoot(), moveRoot(), unloadRoot()
  css utils
  router()
  validation api
    const validate = this.useValidate((errors) => {
      if (state.username.length < 4) errors.username = "Username must have at least 4 characters."
    });
    const onSubmit = () => {
      if (validate()) {
        // ...
      }
    }
  useLocalStorage()
*/
// TODO: more input components (icon button, radio, checkbox/switch, select, date/date range input, file input)
// TODO: badgeWrapper
// TODO: snackbar api
// https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-line-clamp ?
// TODO: dateTimeInput({locale: {daysInWeek: string[], firstDay: number, utcOffset: number}})
const request_cache/*: Record<string, any>*/ = {};
function defaultOnError(error/*: Response*/) {
  console.error(error);
}
/*type ResponseType = 'json' | 'text' | 'blob'*/;

/*type UseCachedRequestProps<R extends ResponseType> = {
  component: Component | undefined;
  url: RequestInfo | URL;
  responseType?: R;
  onError?: (error: Response) => void;
} & RequestInit*/;
/*type UseCachedRequest<T, R extends ResponseType> = {
  data: R extends 'text' ? string | undefined : (
    R extends 'blob' ? Blob | undefined : T | undefined
  );
  refetch: () => void;
}*/;
function useCachedRequest/*<T, R extends ResponseType = 'json'>*/(props/*: UseCachedRequestProps<R>*/)/*: UseCachedRequest<T, R>*/ {
  const {component, url, responseType = 'json', onError = defaultOnError, ...extraOptions} = props;
  const cache_key = [
    url,
    props.method ?? 'GET',
    JSON.stringify(props.headers ?? {}),
    JSON.stringify(props.body ?? {}),
  ].join(',');
  const cached_response = request_cache[cache_key];
  if (cached_response === undefined) {
    request_cache[cache_key] = null;
    fetch(url, extraOptions).then(async (response) => {
      let response_mapped;
      switch (responseType) {
      case 'json':
        response_mapped = await response.json();
        break;
      case 'text':
        response_mapped = await response.text();
        break;
      case 'blob':
        response_mapped = await response.blob();
        break;
      }
      request_cache[cache_key] = response_mapped;
      component?.rerender();
    }).catch(onError);
  }
  return {
    data: cached_response ?? undefined,
    refetch: () => {
      delete request_cache[cache_key];
      component?.rerender();
    },
  };
}
function clearRequestCache(prefix/*: string*/ = '') {
  for (let key of Object.keys(request_cache)) {
    if (key.startsWith(prefix)) {
      delete request_cache[key];
    }
  }
}
export const fragment = makeComponent("fragment", function(_props/*: BaseProps*/ = {}) {}, { name: '' });
export const ul = makeComponent("ul", function(_props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("ul"));
});
export const ol = makeComponent("ol", function(_props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("ol"));
});
export const li = makeComponent("li", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("li"));
  this.append(text);
});
export const h1 = makeComponent("h1", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("h1"));
  this.append(text);
});
export const h2 = makeComponent("h2", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("h2"));
  this.append(text);
});
export const h3 = makeComponent("h3", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("h3"));
  this.append(text);
});
export const h4 = makeComponent("h4", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("h4"));
  this.append(text);
});
export const h5 = makeComponent("h5", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("h5"));
  this.append(text);
});
export const h6 = makeComponent("h6", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("h6"));
  this.append(text);
});
export const divider = makeComponent("divider", function(vertical/*: boolean*/ = false, _props/*: BaseProps*/ = {}) {
  this.append(div({
    attribute: {dataVertical: vertical},
  }));
});
export const p = makeComponent("p", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("p"));
  this.append(text);
});
export const b = makeComponent("b", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("b"));
  this.append(text);
});
export const em = makeComponent("em", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("em"));
  this.append(text);
});
export const br = makeComponent("br", function(_props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("br"));
});
export const code = makeComponent("code", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("code"));
  this.append(text);
});
/*type HyperlinkProps = BaseProps & {
  href?: string;
}*/;
export const hyperlink = makeComponent("a", function(text/*: string*/, props/*: HyperlinkProps*/ = {}) {
  const node = this.useNode(() => document.createElement("a"));
  node.href = props.href ?? "";
  this.append(text);
});
export const form = makeComponent("form", function(_props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("form"));
});
export const button = makeComponent("button", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("button"));
  this.append(text);
});
export const inputLabel = makeComponent("label", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("label"));
  this.append(text);
});
export const input = makeComponent("input", function(_props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("input"));
});
/*export type TextAreaProps = BaseProps & {
  onPaste?: (event: ClipboardEvent, clipboardData: DataTransfer) => string;
}*/;
export const textarea = makeComponent("textarea", function(props/*: TextAreaProps*/ = {}) {
  const {onPaste = (_event, clipboardData) => {
    return clipboardData.getData("Text");
  }} = props;
  const node = this.useNode(() => document.createElement("span"));
  node.contentEditable = "true";
  const events = this.baseProps.events;
  if (events.paste === undefined) {
    events.paste = (event) => {
      event.preventDefault();
      const replaceString = onPaste(event, event.clipboardData /*as DataTransfer*/)
      const selection = window.getSelection() /*as Selection*/;
      const {anchorOffset: selectionA, focusOffset: selectionB} = selection;
      const selectionStart = Math.min(selectionA, selectionB);
      const selectionEnd = Math.max(selectionA, selectionB);
      const prevValue = node.innerText;
      const newValue = prevValue.slice(0, selectionStart) + replaceString + prevValue.slice(selectionEnd)
      node.innerText = newValue;
      const newSelectionEnd = selectionStart + replaceString.length;
      selection.setPosition(node.childNodes[0], newSelectionEnd);
    }
  }
});
export const img = makeComponent("img", function(src/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("img"));
  this.baseProps.attribute.src = src;
});
export const svg = makeComponent("svg", function(svgText/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => {
    const tmp = document.createElement("span");
    tmp.innerHTML = svgText;
    return (tmp.children[0] ?? document.createElement("svg")) /*as NodeType*/;
  });
});
export const audio = makeComponent("audio", function(src/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("audio"));
  this.baseProps.attribute.src = src;
});
export const video = makeComponent("video", function(sources/*: string[]*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => {
    const node = document.createElement("video");
    for (let source of sources) {
      const sourceNode = document.createElement("source");
      sourceNode.src = source;
      node.append(sourceNode);
    }
    return node;
  }, JSON.stringify(sources));
});
export const div = makeComponent("div", function(_props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement('div'));
});
export const legend = makeComponent("legend", function(text/*: string*/, _props/*: BaseProps*/ = {}) {
  this.useNode(() => document.createElement("legend"));
  this.append(text);
  this.baseProps.className.push("ellipsis");
});

// span
/*export type SpanProps = BaseProps & {
  iconName?: string;
  size?: Size;
  color?: string;
  singleLine?: string;
  fontFamily?: string;
  href?: string;
  download?: string;
  navType?: NavType;
  id?: string;
  selfLink?: string;
  onClick?: (event: PointerEvent) => void;
}*/;
export const span = makeComponent("span", function(text/*: string | number | null | undefined*/, props/*: SpanProps*/ = {}) {
  let { iconName, size, color, singleLine, fontFamily, href, download, navType, id, selfLink, onClick } = props;
  if (selfLink != null) {
    const selfLinkWrapper = this.append(div({ className: "self-link", attribute: { id: id == null ? selfLink : id } }));
    selfLinkWrapper.append(span(text, {...props, selfLink: undefined}));
    selfLinkWrapper.append(icon("tag", { size: Size.normal, href: `#${selfLink}` }));
    return;
  }
  const isLink = (href != null);
  const element = this.useNode(() => document.createElement(isLink ? 'a' : 'span'));
  const {attribute, className, style, events} = this.baseProps;
  if (id) attribute.id = id;
  if (download) attribute.download = download;
  if (size) attribute.dataSize = size;
  if (iconName) className.push("material-symbols-outlined");
  if (color) style.color = `var(--${color})`;
  if (singleLine) className.push("ellipsis");
  if (fontFamily) style.fontFamily = `var(--fontFamily-${fontFamily})`;
  if (isLink) (element /*as HTMLAnchorElement*/).href = href;
  if (onClick || href) {
    if (!isLink) {
      attribute.tabindex = "-1";
      attribute.clickable = "true";
    }
    if (events.touchstart === undefined) {
      events.touchstart = ((event/*: TouchEvent*/) => {
        event.preventDefault();
      });
    }
    // TODO!: do we need to implement our own onClick, or can we just use pointerup?
    if (events.pointerdown === undefined) {
      events.pointerdown = onClick;
    }
    if (events.pointerup === undefined) {
      events.pointerup = ((event/*: PointerEvent*/) => {
        if (href && !download) {
          event.preventDefault();
          navigate(href, navType);
        }
      });
    }
  }
  this.append(iconName || (text == null ? "" : String(text)))
});
// https://fonts.google.com/icons
/*export type IconProps = SpanProps*/;
export const icon = makeComponent("icon", function(iconName/*: string*/, props/*: IconProps*/ = {}) {
  let {size, style = {}, ...extraProps} = props;
  this.baseProps.attribute.dataIcon = iconName;
  this.append(span("", {iconName, size, style, ...extraProps}));
});
function generateFontSizeCssVars(names/*: string[]*/ = Object.values(Size)) {
  /*type SizeDef = {
    fontSize: number;
    iconSize: number;
    size: number;
  }*/;
  const getSizeDef = (i/*: number*/) => ({
    size: 19 + i*4,
    iconSize: 14 + i*4,
    fontSize: 14 + i*4,
  }) /*as SizeDef*/;
  let acc = "  /* generated by generateFontSizeCssVars */";
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const {size, fontSize, iconSize} = getSizeDef(i);
    acc += `\n  --size-${name}: ${size}px;`;
    acc += `\n  --iconSize-${name}: ${iconSize}px;`;
    acc += `\n  --fontSize-${name}: ${fontSize}px;`;
  }
  return acc;
}
setTimeout(() => {
  //console.log(generateFontSizeCssVars());
})
/*export type InputProps = {
  type?: "text";
  placeholder?: string;
  value: string | number | null | undefined;
  autoFocus?: boolean;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onRawInput?: (event: InputEventWithTarget) => void;
  onInput?: (event: InputEventWithTarget) => void;
  onChange?: (event: ChangeEventWithTarget) => void;
  allowDisplayString?: (value: string) => boolean;
  allowString?: (value: string) => string | undefined;
} & BaseProps*/;
export const controlledInput = makeComponent("controlledInput", function(props/*: InputProps*/) {
  const { type = "text", placeholder, value, autoFocus, onFocus, onBlur, onKeyDown, onRawInput, onInput, onChange,
    allowDisplayString = () => true,
    allowString = (value) => value,
  } = props;
  const [state] = this.useState({ prevAllowedDisplayString: String(value ?? ''), prevAllowedString: '' });
  state.prevAllowedString = String(value ?? '');
  const element = this.useNode(() => document.createElement('input'));
  element.type = type;
  if (placeholder) element.placeholder = placeholder;
  if (autoFocus) element.autofocus = true;
  if (value != null) element.value = String(value);
  element.onfocus = onFocus /*as _EventListener*/;
  element.onblur = onBlur /*as _EventListener*/;
  element.onkeydown = onKeyDown /*as _EventListener*/;
  element.oninput = (_event) => {
    const event = _event /*as InputEventWithTarget*/;
    if (event.data != null && !allowDisplayString(element.value)) {
      event.preventDefault();
      event.stopPropagation();
      element.value = state.prevAllowedDisplayString;
      return;
    }
    state.prevAllowedDisplayString = element.value;
    if (onRawInput) onRawInput(event);
    const allowedString = allowString(element.value);
    if (allowedString === element.value && onInput) onInput(event);
  }
  element.onchange = (_event) => { // NOTE: called only on blur
    const event = _event /*as ChangeEventWithTarget*/;
    const allowedString = allowString(element.value) ?? state.prevAllowedString;
    state.prevAllowedString = allowedString;
    if (element.value !== allowedString) {
      element.value = allowedString;
      const target = event.target;
      if (onRawInput) onRawInput({target} /*as InputEventWithTarget*/);
      if (onInput) onInput({target} /*as InputEventWithTarget*/);
    }
    if (onChange) onChange(event);
  };
});
/*export type LabeledInputProps = {
  label?: string;
  leftComponent?: () => Component;
  inputComponent: Component;
  rightComponent?: () => Component;
} & BaseProps*/;
export const labeledInput = makeComponent("labeledInput", function(props/*: LabeledInputProps*/) {
  const {label = " ", leftComponent, inputComponent, rightComponent} = props;
  const fieldset = this.useNode(() => document.createElement("fieldset"));
  fieldset.onpointerdown = (_event/*: PointerEvent*/) => {
    const inputNode = inputComponent._.prevNode /*as ParentNodeType*/;
    inputNode.focus(); // TODO: does this break mobile text select or not?
  }
  this.append(legend(label))
  if (leftComponent) this.append(leftComponent());
  this.append(inputComponent);
  if (rightComponent) this.append(rightComponent());
});
export const errorMessage = makeComponent("errorMessage", function(error/*: string*/, props/*: SpanProps*/ = {}) {
  this.append(span(error, {color: "red", size: Size.small, ...props}));
});

/*export type TextInputProps = Omit<InputProps, "value"> & Omit<LabeledInputProps, "inputComponent"> & {
  error?: string,
  value: string | null | undefined;
}*/;
export const textInput = makeComponent("textInput", function(props/*: TextInputProps*/) {
  const {label, leftComponent, rightComponent, error, ...extraProps} = props;
  this.append(labeledInput({
    label,
    leftComponent,
    inputComponent: controlledInput(extraProps),
    rightComponent,
  }));
  if (error) this.append(errorMessage(error));
});
/*export type UseOnPointerMoveValue = {
  rect: DOMRect;
  fractionX: number;
  fractionY: number;
}*/;
/*export type UseOnPointerMoveProps = {
  getNode?: (node: ParentNodeType) => ParentNodeType;
  onPointerDown?: (event: PointerEvent, value: UseOnPointerMoveValue) => void;
  onPointerMove?: (event: PointerEvent, value: UseOnPointerMoveValue) => void;
  onPointerUp?: (event: PointerEvent, value: UseOnPointerMoveValue) => void;
}*/;
/*export type UseOnPointerMove = {
  onPointerDown: (event: PointerEvent) => void;
}*/;
function useOnPointerMove(props/*: UseOnPointerMoveProps*/)/*: UseOnPointerMove*/ {
  const {
    getNode = (v) => v,
    onPointerDown: userOnPointerDown,
    onPointerMove: userOnPointerMove,
    onPointerUp: userOnPointerUp,
  } = props;
  // NOTE: this will be recreated on next render, but remembered by the callback :shrug:
  const ref = {startTarget: null /*as ParentNodeType | null*/};
  const getPointerPosition = (event/*: PointerEvent*/) => {
    if (ref.startTarget === null) {
      ref.startTarget = event.target /*as ParentNodeType*/;
    }
    const node = getNode(ref.startTarget /*as ParentNodeType*/);
    const rect = node.getBoundingClientRect();
    const fractionX = (event.clientX - rect.left) / rect.width;
    const fractionY = (event.clientY - rect.top) / rect.height;
    return {rect, fractionX, fractionY};
  }
  const onPointerMove = (event/*: PointerEvent*/) => {
    if (userOnPointerMove) userOnPointerMove(event, getPointerPosition(event));
  };
  const onPointerUp = (event/*: any*/) => {
    window.removeEventListener("pointercancel", onPointerUp);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointermove", onPointerMove);
    if (userOnPointerUp) userOnPointerUp(event, getPointerPosition(event));
  };
  const onPointerDown = (event/*: PointerEvent*/) => {
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);
    event.preventDefault();
    if (userOnPointerDown) userOnPointerDown(event, getPointerPosition(event));
  };
  return {onPointerDown};
}

// slider input
/*export type SliderInputProps = BaseProps & {
  range: [number, number];
  decimalPlaces?: number;
  value?: number | null;
  onInput?: (event: {target: {value: number}}) => void;
  onChange?: (event: {target: {value: number}}) => void;
  railProps?: BaseProps;
  knobProps?: BaseProps;
}*/;
export const sliderInput = makeComponent("sliderInput", function(props/*: SliderInputProps*/) {
  const {range, decimalPlaces, value, onInput, onChange, railProps, knobProps} = props;
  const [state, setState] = this.useState({
    value: range[0],
  });
  if (value != null) state.value = value;
  // elements
  let t = unlerp(state.value ?? range[0], range[0], range[1]);
  t = clamp(t, 0, 1);
  const leftPercent = addPercent(t);
  const element = this.useNode(() => document.createElement("div"));
  const rail = this.append(div({className: "slider-input-rail", ...railProps}));
  rail.append(div({
    className: "slider-input-rail slider-input-color-rail",
    style: {width: leftPercent},
    ...knobProps,
  }));
  rail.append(div({
    className: "slider-input-knob",
    style: {left: leftPercent},
    ...knobProps,
  }));
  // events
  const updateValue = (pointerPos/*: UseOnPointerMoveValue*/) => {
    const {fractionX} = pointerPos;
    let newValue = lerp(fractionX, range[0], range[1]);
    newValue = +newValue.toFixed(decimalPlaces ?? 0);
    newValue = clamp(newValue, range[0], range[1]);
    setState({value: newValue});
    if (onInput) onInput({target: {value: newValue}});
  }
  const {onPointerDown} = useOnPointerMove({
    getNode: () => rail.getNode() /*as ParentNodeType*/,
    onPointerDown: (_event, pointerPos) => updateValue(pointerPos),
    onPointerMove: (_event, pointerPos) => updateValue(pointerPos),
    onPointerUp: (_event, pointerPos) => {
      updateValue(pointerPos);
      if (onChange) onChange({target: {value: state.value}});
    },
  });
  element.onpointerdown = onPointerDown;
});
/*export type NumberArrowProps = {
  onClickUp?: (event: PointerEvent) => void;
  onClickDown?: (event: PointerEvent) => void;
} & BaseProps*/;
export const numberArrows = makeComponent("numberArrows", function(props/*: NumberArrowProps*/ = {}) {
  const { onClickUp, onClickDown } = props;
  this.useNode(() => document.createElement("div"));
  this.append(icon("arrow_drop_up", {size: Size.small, onClick: onClickUp}));
  this.append(icon("arrow_drop_down", {size: Size.small, onClick: onClickDown}));
  this.append(div({className: "number-arrows-divider"}));
});
/*export type NumberInputProps = InputProps & Omit<LabeledInputProps, "inputComponent"> & {
  error?: string,
  min?: number,
  max?: number,
  step?: number,
  stepPrecision?: number,
  clearable?: boolean,
  onRawInput?: ((event: InputEventWithTarget) => void);
  onInput?: ((event: InputEventWithTarget) => void);
  onChange?: ((event: ChangeEventWithTarget) => void)
}*/;
export const numberInput = makeComponent("numberInput", function(props/*: NumberInputProps*/) {
  const {
    label, leftComponent, rightComponent, error, // labeledInput
    value, min, max, step, stepPrecision, clearable = true, onKeyDown, onRawInput, onInput, onChange, ...extraProps // numberInput
  } = props;
  const stepAndClamp = (number/*: number*/) => {
    if (step) {
      const stepOffset = min ?? max ?? 0;
      number = stepOffset + Math.round((number - stepOffset) / step) * step;
    }
    number = Math.min(number, max ?? 1/0);
    number = Math.max(min ?? -1/0, number);
    const defaultStepPrecision = String(step).split(".")[1]?.length ?? 0;
    return number.toFixed(stepPrecision ?? defaultStepPrecision);
  };
  const incrementValue = (by/*: number*/) => {
    const number = stepAndClamp(+(value ?? 0) + by);
    const newValue = String(number);
    const target = inputComponent._.prevNode /*as HTMLInputElement*/;
    target.value = newValue;
    if (onRawInput) onRawInput({target} /*as unknown*/ /*as InputEventWithTarget*/);
    if (onInput) onInput({target} /*as unknown*/ /*as InputEventWithTarget*/);
    if (onChange) onChange({target} /*as ChangeEventWithTarget*/);
  };
  const inputComponent = controlledInput({
    value,
    onKeyDown: (event/*: KeyboardEvent*/) => {
      switch (event.key) {
        case "ArrowUp":
          incrementValue(step ?? 1);
          event.preventDefault();
          break;
        case "ArrowDown":
          incrementValue(-(step ?? 1));
          event.preventDefault();
          break;
      }
      if (onKeyDown) onKeyDown(event);
    },
    onRawInput,
    onInput,
    onChange,
    allowDisplayString: (value) => value.split("").every((c, i) => {
      if (c === "-" && i === 0) return true;
      if (c === "." && ((step ?? 1) % 1) !== 0) return true;
      return "0123456789".includes(c);
    }),
    allowString: (value) => {
      const isAllowed = (value === "") ? clearable : !isNaN(+value);
      if (isAllowed) {
        return String(stepAndClamp(+value));
      }
    }
  });
  this.append(labeledInput({
    label,
    leftComponent,
    inputComponent,
    rightComponent: () => {
      const acc = fragment();
      if (rightComponent) acc.append(rightComponent());
      acc.append(numberArrows({
        onClickUp: (_event/*: PointerEvent*/) => {
          incrementValue(step ?? 1);
          inputComponent._.state/*!*/.needFocus = true;
          inputComponent.rerender();
        },
        onClickDown: (_event/*: PointerEvent*/) => {
          incrementValue(-(step ?? 1));
          inputComponent._.state/*!*/.needFocus = true;
          inputComponent.rerender();
        },
      }));
      return acc;
    },
  }));
  if (error) this.append(errorMessage(error));
});
/*export type ButtonProps = {
  size?: Size;
  color?: BaseColor;
  onClick?: () => void;
  disabled?: boolean;
}
*/export const coloredButton = makeComponent("coloredButton", function(text/*: string*/, props/*: ButtonProps*/ = {}) {
  const {size, color, onClick, disabled} = props;
  const element = this.useNode(() => document.createElement("button"));
  if (text) this.append(span(text));
  const {attribute} = this.baseProps;
  if (size) attribute.dataSize = size;
  if (color) attribute.dataColor = color;
  if (disabled) attribute.disabled = "true";
  else if (onClick) {
    element.onpointerdown = () => {
      onClick();
    }
  }
});
/*type _GPU = {
  requestAdapter(): Promise<_GPUAdapter>;
  getPreferredCanvasFormat(): any;
}*/;
/*type _GPUAdapter = {
  requestDevice(): Promise<_GPUDevice>;
}*/;
/*type _GPUDevice = {
  createShaderModule(options: {code: string}): _GPUShaderModule;
}*/;

/*type _GPUShaderModule = any*/;
/*declare global {
  interface Window {
    GPUBufferUsage: {
      COPY_DST: number;
      COPY_SRC: number;
      INDEX: number;
      INDIRECT: number;
      MAP_READ: number;
      MAP_WRITE: number;
      QUERY_RESOLVE: number;
      STORAGE: number;
      UNIFORM: number;
      VERTEX: number;
    }
  }
  interface Navigator {
    gpu: _GPU | undefined;
  }
}

*//*type WebgpuContextType = {
  configure: (options: any) => void;
}*/;

/* component */
/*type WebgpuRenderProps = {
  // NOTE: any because we don't have the complete types..
  gpu: any;
  context: any;
  device: any;
  shaderModule: any;
  data: any; // custom user data
}*/;
/*type WebgpuProps = {
  shaderCode: string;
  init?: (props: WebgpuRenderProps) => any;
  render?: (props: WebgpuRenderProps) => void;
} & BaseProps*/;
export const webgpu = makeComponent("webgpu", function(props/*: WebgpuProps*/) {
  const {shaderCode, init, render} = props;
  const [state] = this.useState({
    _isDeviceInitialized: false,
    device: null /*as _GPUDevice | null*/,
    shaderModule: null /*as any*/,
    context: null /*as WebgpuContextType | null*/,
    data: null /*as any*/,
  });
  const node = this.useNode(() => document.createElement("canvas"));

  const {gpu} = navigator;
  if (!state._isDeviceInitialized) {
    state._isDeviceInitialized = true;
    if (!gpu) {
      console.error("WebGPU is not supported in this browser.")
      return;
    }
    gpu.requestAdapter().then((adapter) => {
      if (!adapter) {
        console.error("Couldn't request WebGPU adapter.");
        return;
      }
      adapter.requestDevice().then((device) => {
        state.device = device;
        // TODO: create/delete shaders dynamically (device.destroy()?)?
        state.shaderModule = device.createShaderModule({code: shaderCode});
        this.rerender();
      });
    });
  }
  if (!state.context && state.device) {
    state.context = node.getContext("webgpu") /*as unknown*/ /*as WebgpuContextType | null*/;
    state.context?.configure({
      device: state.device,
      format: gpu?.getPreferredCanvasFormat(),
      alphaMode: 'premultiplied',
    });
    if (init) {
      state.data = init({gpu, ...state});
    }
  }
  return {
    onMount: () => {
      // autosize canvas
      const rect = node.getBoundingClientRect();
      node.width = rect.width;
      node.height = rect.height;
      // render
      if (state.context && state.device && state.shaderModule && render) {
        render({gpu, ...state});
      }
    }
  }
});
/*type ErrorValue = any[] | undefined*/;
function glGetShaderLog(gl/*: WebGL2RenderingContext*/, shader/*: WebGLShader*/, shaderCode/*: string*/) {
  const shaderLines = shaderCode.split("\n");
  const rawShaderLog = gl.getShaderInfoLog(shader) ?? "";
  let prevLineNumberToShow = null /*as number | null*/;
  let acc = "";
  for (let logLine of rawShaderLog.split("\n")) {
    const match = logLine.match(/^ERROR: \d+:(\d+)/);
    let lineNumberToShow = null /*as number | null*/;
    if (match != null) {
      lineNumberToShow = +match[1] - 1;
    }
    if (prevLineNumberToShow != null && prevLineNumberToShow !== lineNumberToShow) {
      const line = (shaderLines[prevLineNumberToShow] ?? "").trim()
      prevLineNumberToShow = lineNumberToShow;
      acc += `  ${line}\n${logLine}\n`;
    } else {
      prevLineNumberToShow = lineNumberToShow;
      acc += `${logLine}\n`;
    }
  }
  return acc;
}
function glCompileShader(gl/*: WebGL2RenderingContext*/, program/*: WebGLProgram*/, shaderType/*: number*/, shaderCode/*: string*/)/*: ErrorValue*/ {
  const shader = gl.createShader(shaderType);
  while (1) {
    if (!shader) break;
    gl.shaderSource(shader, shaderCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) break;
    gl.attachShader(program, shader);
    return;
  }
  const ShaderTypeName/*: Record<any, string | undefined>*/ = {
    [gl.VERTEX_SHADER]: ".VERTEX_SHADER",
    [gl.FRAGMENT_SHADER]: ".FRAGMENT_SHADER",
  };
  const shaderLog = glGetShaderLog(gl, shader/*!*/, shaderCode);
  return [
    `Could not compile shader:\n${shaderLog}`,
    {
      program,
      shaderType: ShaderTypeName[shaderType] ?? shaderType,
      shaderCode,
      shader,
    }
  ]
}
function glCompileProgram(gl/*: WebGL2RenderingContext*/, programInfo/*: GLProgramInfo*/)/*: ErrorValue*/ {
  const {program, vertex, fragment} = programInfo;
  let error = glCompileShader(gl, program, gl.VERTEX_SHADER, vertex);
  if (error) return error;

  error = glCompileShader(gl, program, gl.FRAGMENT_SHADER, fragment);
  if (error) return error;

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const programLog = gl.getProgramInfoLog(program);
    return [`Error linking shader program:\n${programLog}`, {program}]
  }
  gl.useProgram(program);
}
function glDecodeVertexAttributeType(gl/*: WebGL2RenderingContext*/, flatType/*: GLenum*/)/*: [GLenum, number]*/ {
  switch (flatType) {
  /* WebGL */
  case gl.FLOAT:
    return [gl.FLOAT, 1];
  case gl.FLOAT_VEC2:
    return [gl.FLOAT, 2];
  case gl.FLOAT_VEC3:
    return [gl.FLOAT, 3];
  case gl.FLOAT_VEC4:
    return [gl.FLOAT, 4];
  case gl.FLOAT_MAT2:
    return [gl.FLOAT, 4];
  case gl.FLOAT_MAT3:
    return [gl.FLOAT, 9];
  case gl.FLOAT_MAT4:
    return [gl.FLOAT, 16];
  // NOTE: non-square matrices are only valid as uniforms
  /* WebGL2 */
  case gl.INT:
    return [gl.INT, 1];
  case gl.INT_VEC2:
    return [gl.INT, 2];
  case gl.INT_VEC3:
    return [gl.INT, 3];
  case gl.INT_VEC4:
    return [gl.INT, 4];
  case gl.UNSIGNED_INT:
    return [gl.UNSIGNED_INT, 1];
  case gl.UNSIGNED_INT_VEC2:
    return [gl.UNSIGNED_INT, 2];
  case gl.UNSIGNED_INT_VEC3:
    return [gl.UNSIGNED_INT, 3];
  case gl.UNSIGNED_INT_VEC4:
    return [gl.UNSIGNED_INT, 4];
  }
  console.error('Uknown vertexAttribute type:', {flatType});
  return [-1, -1];
}
// user utils
function glUseProgram(gl/*: WebGL2RenderingContext*/, programInfo/*: GLProgramInfo*/) {
  gl.useProgram(programInfo.program);
  gl.bindVertexArray(programInfo.vao);
}
function glSetBuffer(gl/*: WebGL2RenderingContext*/, bufferInfo/*: GLBufferInfo*/, data/*: any*/) {
  const {location, count, type, bufferIndex} = bufferInfo;
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferIndex);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const FLOAT_SIZE = 4; // we are assuming `#precision highp float;`
  if (type === gl.FLOAT) {
    let currentLocation = location;
    let remainingCount = count;
    const stride = count * FLOAT_SIZE;
    let currentOffset = 0;
    while (remainingCount >= 4) {
      gl.enableVertexAttribArray(currentLocation);
      gl.vertexAttribPointer(currentLocation++, 4, type, false, stride, currentOffset);
      remainingCount -= 4;
      currentOffset += 4 * FLOAT_SIZE;
    }
    if (remainingCount > 0) {
      gl.enableVertexAttribArray(currentLocation);
      gl.vertexAttribPointer(currentLocation++, remainingCount, type, false, stride, currentOffset);
    }
  } else {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribIPointer(location, count, type, 0, 0);
  }
}

// data
/*export type GLBufferInfo = {
  location: number;
  count: number; // can be >4 for matrices
  type: GLenum; // gl.FLOAT | ...
  bufferIndex: WebGLBuffer;
}*/;

/*export type GLProgramDescriptor = {
  vertex: string;
  fragment: string;
}*/;
/*export type GLProgramInfo = {
  program: WebGLProgram;
  vertex: string;
  fragment: string;
  vao: WebGLVertexArrayObject;
  buffers: Record<string, GLBufferInfo>;
} & Record<`v_${string}`, GLBufferInfo> & Record<`u_${string}`, WebGLUniformLocation>*/;

// component
/*type WebGLState = {
  gl: WebGL2RenderingContext;
  programs: Record<string, GLProgramInfo>;
  rect: DOMRect;
  didCompile: boolean;
}*/;
/*export type WebGLProps = BaseProps & {
  programs: Record<string, GLProgramDescriptor>;
  renderResolutionMultiplier?: number;
  render?: (state: WebGLState) => void;
}
*/export const webgl = makeComponent("webgl", function(props/*: WebGLProps*/) {
  const {
    programs,
    renderResolutionMultiplier = 1.0,
    render = ({gl}) => {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }} = props;
  const node = this.useNode(() => document.createElement("canvas"));
  /*type PartiallyUninitialized<T, K extends keyof T> = Omit<T, K> & {[K2 in K]: T[K2] | null}*/;
  /*type WebGlStateUninitialized = PartiallyUninitialized<WebGLState, 'gl' | 'programs'>*/;
  const [state] = this.useState/*<WebGlStateUninitialized>*/({
    gl: null,
    programs: null,
    rect: new DOMRect(),
    didCompile: false,
  });
  if (state.gl == null) {
    const gl = node.getContext("webgl2");
    if (!gl) return;
    state.gl = gl;
    // init shaders
    state.programs = {};
    const DEFAULT_SHADER_VERSION = "#version 300 es\n";
    const DEFAULT_FLOAT_PRECISION = "precision highp float;\n"
    const addShaderHeader = (headerCode/*: string*/, shaderCode/*: string*/) => {
      return shaderCode.trimStart().startsWith("#version") ? shaderCode : headerCode + shaderCode
    }
    for (let [k, _programInfo] of Object.entries(programs)) {
      const programInfo = _programInfo /*as GLProgramInfo*/;
      state.programs[k] = programInfo;
      // compile
      programInfo.program = gl.createProgram();
      programInfo.vertex = addShaderHeader(DEFAULT_SHADER_VERSION, programInfo.vertex);
      programInfo.fragment = addShaderHeader(DEFAULT_SHADER_VERSION + DEFAULT_FLOAT_PRECISION, programInfo.fragment);
      let error = glCompileProgram(gl, programInfo);
      if (error) {
        console.error(...error);
        break;
      }
      state.didCompile = true;
      // init vertex buffers
      programInfo.vao = gl.createVertexArray(); // vao means vertexBuffer[]
      gl.bindVertexArray(programInfo.vao);
      const vertexBufferCount = gl.getProgramParameter(programInfo.program, gl.ACTIVE_ATTRIBUTES);
      for (let i = 0; i < vertexBufferCount; i++) {
        const vertexAttribute = gl.getActiveAttrib(programInfo.program, i);
        if (vertexAttribute == null) {
          console.error(`Couldn't get vertexAttribute:`, {i});
          continue
        }
        const vertexAttributeLocation = gl.getAttribLocation(programInfo.program, vertexAttribute.name);
        if (vertexAttributeLocation == null) {
          console.error(`Couldn't get vertexAttribute location:`, {i, vertexAttribute});
          continue
        }
        const [type, count] = glDecodeVertexAttributeType(gl, vertexAttribute.type);
        programInfo[vertexAttribute.name /*as `v_${string}`*/] = {
          location: vertexAttributeLocation,
          count,
          type,
          bufferIndex: gl.createBuffer(),
        };
      }
      // get uniform locations
      const uniformCount = gl.getProgramParameter(programInfo.program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const uniform = gl.getActiveUniform(programInfo.program, i);
        if (uniform == null) {
          console.error(`Couldn't get uniform:`, {i});
          continue
        }
        const uniformLocation = gl.getUniformLocation(programInfo.program, uniform.name);
        if (uniformLocation == null) {
          console.error(`Couldn't get uniform location:`, {i, uniform});
          continue
        }
        programInfo[uniform.name /*as `u_${string}`*/] = uniformLocation;
      }
    }
  }
  return {
    onMount: () => {
      // autosize canvas
      const rect = node.getBoundingClientRect();
      rect.width *= renderResolutionMultiplier;
      rect.height *= renderResolutionMultiplier;
      node.width = rect.width;
      node.height = rect.height;
      state.rect = rect;
      // render
      const {gl, didCompile} = state;
      if (didCompile && gl != null) {
        gl.viewport(0, 0, rect.width, rect.height);
        render(state /*as WebGLState*/);
      }
    },
  }
});
export const loadingSpinner = makeComponent("loadingSpinner", function(props/*: IconProps*/ = {}) {
  this.append(icon("progress_activity", props));
});
/*export type ProgressProps = {
  color?: string;
  fraction?: number;
} & BaseProps*/;
export const progress = makeComponent("progress", function(props/*: ProgressProps*/ = {}) {
  const {color, fraction} = props;
  if (color) this.baseProps.style.color = `var(--${color})`;
  const wrapper = this.append(div({}));
  wrapper.append(div(fraction == null
    ? {className: 'progress-bar progress-bar-indeterminate'}
    : {className: 'progress-bar', style: {width: addPercent(fraction)}}
  ));
});
// tabs
/*export type TabsOptionComponentProps = {key: string, className: string}*/;
/*export type TabsOption = {
  id?: string | number;
  label: string;
  href?: string;
}*/;
/*export type TabsProps = BaseProps & {
  options: TabsOption[];
  selectedId: string | number;
  setSelectedId: (newId: string | number) => void;
}*/;
export const tabs = makeComponent("tabs", function(props/*: TabsProps*/) {
  const {options, setSelectedId} = props;
  let {selectedId} = props;
  if (selectedId == null) selectedId = options[0].id ?? 0;
  const tabsHeader = this.append(div({className: "tabs-header"}));
  options.forEach((option, i) => {
    const optionId = option.id ?? i;
    tabsHeader.append(span(option.label, {
      key: optionId,
      href: option.href,
      className: "tabs-option",
      attribute: {dataSelected: optionId === selectedId, title: option.label},
      events: {pointerup: () => setSelectedId(optionId)},
    }));
  });
});
/*export type Route = {
  path: string;
  defaultPath?: string;
  component: ComponentFunction<[routeParams: any]>
  roles?: string[];
  wrapper?: boolean;
  showInNavigation?: boolean;
  label?: string;
  group?: string;
}*/;
/*export type FallbackRoute = Omit<Route, "path">*/;
/*export type RouterProps = {
  prefix?: string;
  routes: Route[];
  pageWrapperComponent?: ComponentFunction<[props: PageWrapperProps]>;
  contentWrapperComponent?: ComponentFunction<any>,
  currentRoles?: string[];
  isLoggedIn?: boolean;
  notLoggedInRoute?: FallbackRoute;
  notFoundRoute?: FallbackRoute;
  unauthorizedRoute?: FallbackRoute;
}*/;
/*export type PageWrapperProps = {
  routes: Route[];
  currentRoute: Route;
  routeParams: Record<string, string>,
  contentWrapperComponent: ComponentFunction<any>,
}*/;
export const router = makeComponent("router", function(props/*: RouterProps*/) {
  const {
    prefix = "",
    routes,
    pageWrapperComponent,
    contentWrapperComponent = () => div({ className: "page-content" }),
    currentRoles,
    isLoggedIn,
    notLoggedInRoute = { component: fragment },
    notFoundRoute,
    unauthorizedRoute = { component: fragment },
  } = props;
  this.useLocation(); // rerender on location change
  let currentPath = makePath({origin: '', query: '', hash: ''});
  let currentRoute/*: Route | null*/ = null;
  let currentRouteParams/*: Record<string, string>*/ = {};
  /*type RouteInfo = {
    route: Route;
    paramNames: string[];
    pathRegex: string;
    sortKey: string;
  }*/;
  const routeInfos/*: RouteInfo[]*/ = routes.map(route => {
    const routePrefix = currentPath.startsWith(prefix) ? prefix : "";
    const path = makePath({
      origin: '',
      pathname: routePrefix + route.path,
      query: '',
      hash: '',
    });
    const paramNames/*: string[]*/ = [];
    const pathRegex = path.replace(/:([^/]*)/g, (_m, g1) => {
      paramNames.push(g1);
      return `([^/?]*)`;
    });
    const sortKey = path.replace(/:([^/]*)/g, '');
    return {route, paramNames, pathRegex, sortKey};
  }).sort((a, b) => {
    const aKey = a.sortKey;
    const bKey = b.sortKey;
    return +(aKey < bKey) - +(aKey > bKey); // NOTE: sort descending
  });
  for (let routeInfo of routeInfos) {
    const regex = new RegExp(`^${routeInfo.pathRegex}$`);
    const match = currentPath.match(regex);
    if (match != null) {
      const routeParamEntries = routeInfo.paramNames.map((key, i) => [key, match[i + 1]]);
      currentRouteParams = Object.fromEntries(routeParamEntries);
      const route = routeInfo.route;
      const roles = route.roles ?? [];
      const needSomeRole = (roles.length > 0);
      const haveSomeRole = (currentRoles ?? []).some(role => roles.includes(role));
      if (!needSomeRole || haveSomeRole) {
        currentRoute = route;
      } else {
        currentRoute = {
          path: ".*",
          ...(isLoggedIn ? notLoggedInRoute : unauthorizedRoute),
        };
      }
      break;
    }
  }
  if (!currentRoute) {
    currentRoute = {path: '*', component: () => span("404 Not found")};
    if (notFoundRoute) {
      currentRoute = {...currentRoute, ...notFoundRoute};
    } else {
      console.warn(`Route '${currentPath}' not found. routes:`, routes);
    }
  }
  if (currentRoute.wrapper && pageWrapperComponent != null) {
    this.append(pageWrapperComponent({routes, currentRoute, routeParams: currentRouteParams, contentWrapperComponent}));
  } else {
    const contentWrapper = this.append(contentWrapperComponent());
    contentWrapper.append(currentRoute.component(currentRouteParams));
  }
});
/*export type DialogProps = BaseProps & ({
  open: boolean;
  onClose?: () => void;
  closeOnClickBackdrop?: boolean;
})*/;
export const dialog = makeComponent("dialog", function(props/*: DialogProps*/)/*: RenderReturn*/ {
  const {open, onClose, closeOnClickBackdrop} = props;
  const [state] = this.useState({prevOpen: false});
  const element = this.useNode(() => document.createElement("dialog"));
  element.onclick = (event) => {
    if (closeOnClickBackdrop && (event.target === element) && onClose) onClose();
  }
  return {
    onMount: () => {
      if (open !== state.prevOpen) {
        if (open) {
          element.showModal();
        } else {
          element.close();
        }
        state.prevOpen = open;
      }
    },
  };
});

// popup
/*export type PopupDirection = "up" | "right" | "down" | "left" | "mouse"*/;
function _getPopupLeftTop(direction/*: PopupDirection*/, props/*: {
  mouse: {x: number, y: number},
  wrapperRect: DOMRect,
  popupRect: DOMRect,
}*/) {
  const {mouse, popupRect, wrapperRect} = props;
  switch (direction) {
    case "up":
      return [
        wrapperRect.left + 0.5 * (wrapperRect.width - popupRect.width),
        wrapperRect.top - popupRect.height
      ];
    case "right":
      return [
        wrapperRect.left + wrapperRect.width,
        wrapperRect.top + 0.5 * (wrapperRect.height - popupRect.height)
      ];
    case "down":
      return [
        wrapperRect.left + 0.5 * (wrapperRect.width - popupRect.width),
        wrapperRect.top + wrapperRect.height
      ]
    case "left":
      return [
        wrapperRect.left - popupRect.width,
        wrapperRect.top + 0.5 * (wrapperRect.height - popupRect.height)
      ];
    case "mouse":
      return [
        mouse.x,
        mouse.y - popupRect.height
      ];
  }
}
function _getPopupLeftTopWithFlipAndClamp(props/*: {
  direction: PopupDirection,
  mouse: {x: number, y: number},
  windowRight: number;
  windowBottom: number;
  wrapperRect: DOMRect,
  popupRect: DOMRect,
}*/) {
  let {direction, windowBottom, windowRight, popupRect} = props;
  // flip
  let [left, top] = _getPopupLeftTop(direction, props);
  switch (direction) {
    case "up":
      if (top < 0) {
        direction = "down";
        [left, top] = _getPopupLeftTop(direction, props);
      }
      break;
    case "down": {
      const bottom = top + popupRect.height;
      if (bottom >= windowBottom) {
        direction = "up";
        [left, top] = _getPopupLeftTop(direction, props);
      }
      break;
    }
    case "left":
      if (left < 0) {
        direction = "right";
        [left, top] = _getPopupLeftTop(direction, props);
      }
      break;
    case "right": {
      const right = left + popupRect.width;
      if (right >= windowRight) {
        direction = "left";
        [left, top] = _getPopupLeftTop(direction, props);
      }
      break;
    }
  }
  // clamp
  const maxLeft = windowRight - popupRect.width - SCROLLBAR_WIDTH;
  left = clamp(left, 0, maxLeft);
  const maxTop = windowBottom - popupRect.height - SCROLLBAR_WIDTH;
  top = clamp(top, 0, maxTop);
  return [left, top] /*as [number, number]*/;
}
/*export type PopupWrapperProps = {
  content: Component;
  direction?: PopupDirection;
  // TODO: arrow?: boolean;
  /** NOTE: open on hover if undefined *//*
  open?: boolean;
  interactable?: boolean;
}*/;
export const popupWrapper = makeComponent("popupWrapper", function(props/*: PopupWrapperProps*/)/*: RenderReturn*/ {
  const {content, direction: _direction = "up", open, interactable = false} = props;
  const [state] = this.useState({mouse: {x: -1, y: -1}, open: false, prevOnScroll: null /*as EventListener | null*/});
  const wrapper = this.useNode(() => document.createElement("div"));
  const {windowBottom, windowRight} = this.useWindowResize(); // TODO: just add a window listener?
  const movePopup = () => {
    if (!state.open) return;
    const popupNode = popup._.prevNode /*as HTMLDivElement*/;
    const popupContentWrapperNode = popupContentWrapper._.prevNode /*as HTMLDivElement*/;
    const wrapperRect = wrapper.getBoundingClientRect();
    popupNode.style.left = "0px"; // NOTE: we move popup to top left to allow it to grow
    popupNode.style.top = "0px";
    const popupRect = popupContentWrapperNode.getBoundingClientRect();
    const [left, top] = _getPopupLeftTopWithFlipAndClamp({
      direction: _direction,
      mouse: state.mouse,
      popupRect,
      windowBottom,
      windowRight,
      wrapperRect
    });
    popupNode.style.left = addPx(left);
    popupNode.style.top = addPx(top);
  }
  const openPopup = () => {
    state.open = true;
    (popup._.prevNode /*as HTMLDivElement | null*/)?.showPopover();
    movePopup();
  }
  const closePopup = () => {
    state.open = false;
    (popup._.prevNode /*as HTMLDivElement | null*/)?.hidePopover();
  };
  if (open == null) {
    wrapper.onmouseenter = openPopup;
    wrapper.onmouseleave = closePopup;
  }
  if (_direction === "mouse") {
    wrapper.onmousemove = (event) => {
      state.mouse = {x: event.clientX, y: event.clientY};
      movePopup();
    }
  }
  const popup = this.append(div({
    className: "popup",
    attribute: {popover: "manual", dataInteractable: interactable},
  }));
  const popupContentWrapper = popup.append(div({className: "popup-content-wrapper"}));
  popupContentWrapper.append(content);
  return {
    onMount: () => {
      for (let acc = (this._.prevNode /*as ParentNode | null*/); acc != null; acc = acc.parentNode) {
        acc.removeEventListener("scroll", state.prevOnScroll);
        acc.addEventListener("scroll", movePopup, {passive: true});
      }
      state.prevOnScroll = movePopup;
      if (open == null) return;
      if (open != state.open) {
        if (open) {
          openPopup();
        } else {
          closePopup();
        }
      }
    },
    onUnmount: (removed/*: boolean*/) => {
      if (!removed) return;
      for (let acc = (this._.prevNode /*as ParentNode | null*/); acc != null; acc = acc.parentNode) {
        acc.removeEventListener("scroll", state.prevOnScroll);
      }
    },
  };
});
/*export type TableColumn = {
  label: string;
  render: ComponentFunction<[data: {row: any, rowIndex: number, column: TableColumn, columnIndex: number}]>;
  minWidth?: string | number;
  maxWidth?: string | number;
  flex?: string | number;
}*/;
/*export type TableProps = {
  label?: string;
  columns: TableColumn[];
  rows: any[];
  isLoading?: boolean;
  minHeight?: number;
  useMaxHeight?: boolean;
} & BaseProps*/;
export const table = makeComponent("table", function(props/*: TableProps & BaseProps*/) {
  // TODO: actions, filters, search, paging, selection
  // TODO: make gray fully opaque?
  const {label, columns = [], rows = [], isLoading = false, minHeight = 400, useMaxHeight = false} = props;
  const tableWrapper = this.append(div({
    attribute: {useMaxHeight, isLoading},
    style: {minHeight},
  }));
  const makeRow = (className/*: string*/, key/*: string*/) => div({className, key});
  const makeCell = (column/*: TableColumn*/) => div({
    className: "table-cell",
    style: {flex: String(column.flex ?? 1), minWidth: column.minWidth, maxWidth: column.maxWidth},
  });
  if (label) {
    tableWrapper.append(span(label, {className: "table-label"}));
  }
  if (isLoading) {
    tableWrapper.append(loadingSpinner());
  } else {
    const headerWrapper = tableWrapper.append(makeRow("table-row table-header", "header"));
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const column = columns[columnIndex];
      const cellWrapper = headerWrapper.append(makeCell(column));
      cellWrapper.append(span(column.label));
    }
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      let row = rows[rowIndex];
      const rowWrapper = tableWrapper.append(makeRow("table-row table-body", `row-${rowIndex}`));
      for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
        let column = columns[columnIndex];
        const cellWrapper = rowWrapper.append(makeCell(column));
        cellWrapper.append(column.render({row, rowIndex, column, columnIndex}));
      }
    }
  }
});
