/** An RGBA color, value should be in the range of 0-1 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** A string enum with value, describing the end caps of vector paths. */
export enum StrokeCap {
  NONE = 'NONE',
  ROUND = 'ROUND',
  SQUARE = 'SQUARE',
  LINE_ARROW = 'LINE_ARROW',
  TRIANGLE_ARROW = 'TRIANGLE_ARROW'
}

/** Where stroke is drawn relative to the vector outline as a string enum */
export enum StrokeAlign {
  INSIDE = 'INSIDE',
  OUTSIDE = 'OUTSIDE',
  CENTER = 'CENTER'
}

/** A string enum with value, describing how corners in vector paths are rendered. */
export enum StrokeJoin {
  MITER = 'MITER',
  BEVEL = 'BEVEL',
  ROUND = 'ROUND'
}

export enum ImageType {
  JPG = 'JPG',
  PNG = 'PNG',
  SVG = 'SVG',
  PDF = 'PDF'
}

/** A string enum with value, indicating the type of boolean operation applied */
export enum BooleanOperationType {
  UNION = 'UNION',
  INTERSECT = 'INTERSECT',
  SUBTRACT = 'SUBTRACT',
  EXCLUDE = 'EXCLUDE'
}

/** Text casing applied to the node, default is the original casing */
export enum TextCase {
  ORIGINAL = 'ORIGINAL',
  UPPER = 'UPPER',
  LOWER = 'LOWER',
  TITLE = 'TITLE',
  SMALL_CAPS = 'SMALL_CAPS',
  SMALL_CAPS_FORCED = 'SMALL_CAPS_FORCED'
}

/** Text decoration applied to the node */
export enum TextDecoration {
  NONE = 'NONE',
  STRIKETHROUGH = 'STRIKETHROUGH',
  UNDERLINE = 'UNDERLINE'
}

/** Dimensions along which text will auto resize, default is that the text does not auto-resize. */
export enum TextAutoResize {
  NONE = 'NONE',
  HEIGHT = 'HEIGHT',
  WIDTH_AND_HEIGHT = 'WIDTH_AND_HEIGHT',
  TRUNCATE = 'TRUNCATE'
}

/** The unit of the line height value specified by the user. */
export enum LineHeightUnit {
  PIXELS = 'PIXELS',
  FONT_SIZE_PC = 'FONT_SIZE_%',
  INTRINSIC_PC = 'INTRINSIC_%'
}

/**
 * A mapping of a StyleType to style ID (see Style) of styles present on this node.
 * The style ID can be used to look up more information about the style in the top-level styles field.
 */
export type StylesMap = Record<StyleType, NodeID>;
export type StyleType = 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';

/** Format and size to export an asset at */
export interface ExportSetting {
  /** File suffix to append to all filenames */
  suffix: string;
  /** Image type, string enum that supports values "JPG", "PNG", "SVG" and "PDF" */
  format: ImageType;
  /** Constraint that determines sizing of exported asset */
  constraint: Constrain;
}

export enum ConstrainType {
  /** Scale by value */
  SCALE = 'SCALE',
  /** Scale proportionally and set width to value */
  WIDTH = 'WIDTH',
  /** Scale proportionally and set width to value */
  HEIGHT = 'HEIGHT'
}

/** Sizing constraint for exports */
export interface Constrain {
  /** Type of constraint to apply */
  type: ConstrainType;
  /** See type property for effect of this field */
  value: number;
}

/** Information about the arc properties of an ellipse. 0° is the x-axis and increasing angles rotate clockwise **/
export interface ArcData {
  /** Start of the sweep in radians **/
  startingAngle: number;
  /** End of the sweep in radians **/
  endingAngle: number;
  /** Inner radius value between 0 and 1 **/
  innerRadius: number;
}

/** A rectangle that expresses a bounding box in absolute coordinates */
export interface Rectangle {
  /** X coordinate of top left corner of the rectangle */
  x: number;
  /** Y coordinate of top left corner of the rectangle */
  y: number;
  /** Width of the rectangle */
  width: number;
  /** Height of the rectangle */
  height: number;
}

/**
 * This type is a string enum with the following possible values
 * Normal blends:
 * "PASS_THROUGH" (Only applicable to objects with children)
 * "NORMAL"
 *
 * Darken:
 * "DARKEN"
 * "MULTIPLY"
 * "LINEAR_BURN"
 * "COLOR_BURN"
 *
 * Lighten:
 * "LIGHTEN"
 * "SCREEN"
 * "LINEAR_DODGE"
 * "COLOR_DODGE"
 *
 * Contrast:
 * "OVERLAY"
 * "SOFT_LIGHT"
 * "HARD_LIGHT"
 *
 * Inversion:
 * "DIFFERENCE"
 * "EXCLUSION"
 *
 * Component:
 * "HUE"
 * "SATURATION"
 * "COLOR"
 * "LUMINOSITY"
 */
export enum BlendMode {
  // Normal blends:
  /** (Only applicable to objects with children) */
  PASS_THROUGH = 'PASS_THROUGH',
  /** (Only applicable to objects with children) */
  NORMAL = 'NORMAL',

  /** Darken */
  DARKEN = 'DARKEN',
  MULTIPLY = 'MULTIPLY',
  LINEAR_BURN = 'LINEAR_BURN',
  COLOR_BURN = 'COLOR_BURN',

  /** Lighten */
  LIGHTEN = 'LIGHTEN',
  SCREEN = 'SCREEN',
  LINEAR_DODGE = 'LINEAR_DODGE',
  COLOR_DODGE = 'COLOR_DODGE',

  /** Contrast */
  OVERLAY = 'OVERLAY',
  SOFT_LIGHT = 'SOFT_LIGHT',
  HARD_LIGHT = 'HARD_LIGHT',

  /** Inversion */
  DIFFERENCE = 'DIFFERENCE',
  EXCLUSION = 'EXCLUSION',

  /** Component */
  HUE = 'HUE',
  SATURATION = 'SATURATION',
  COLOR = 'COLOR',
  LUMINOSITY = 'LUMINOSITY'
}

export enum EasingType {
  EASE_IN = 'EASE_IN',
  EASE_OUT = 'EASE_OUT',
  /** Ease in and then out with an animation curve similar to CSS ease-in-out. */
  EASE_IN_AND_OUT = 'EASE_IN_AND_OUT',
  LINEAR = 'LINEAR',
  /** Gentle spring animation similar to react-spring. **/
  GENTLE_SPRING = 'GENTLE_SPRING'
}

export enum LayoutConstraintVertical {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  CENTER = 'CENTER',
  TOP_BOTTOM = 'TOP_BOTTOM',
  SCALE = 'SCALE'
}

export enum LayoutConstraintHorizontal {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  CENTER = 'CENTER',
  /** Both edges (depends on axis) of node are constrained relative to containing frame (node stretches with frame) */
  LEFT_RIGHT = 'LEFT_RIGHT',
  SCALE = 'SCALE'
}

/** A flow starting point used when launching a prototype to enter Presentation view. **/
export interface FlowStartingPoint {
  /** Unique identifier specifying the frame **/
  nodeId: string;
  /** Name of flow **/
  name: string;
}

/** Layout constraint relative to containing Frame */
export interface LayoutConstraint {
  vertical: LayoutConstraintVertical;
  horizontal: LayoutConstraintHorizontal;
}

export enum LayoutAlign {
  /** Determines if the layer should stretch along the parent’s counter axis. This property is only provided for direct children of auto-layout frames. */
  INHERIT = 'INHERIT',
  STRETCH = 'STRETCH',
  /** In horizontal auto-layout frames, "MIN" and "MAX" correspond to "TOP" and "BOTTOM". In vertical auto-layout frames, "MIN" and "MAX" correspond to "LEFT" and "RIGHT". */
  MIN = 'MIN',
  CENTER = 'CENTER',
  MAX = 'MAX'
}

export enum LayoutGridPattern {
  COLUMNS = 'COLUMNS',
  ROWS = 'ROWS',
  GRID = 'GRID'
}

/** MIN/MAX are similar to CSS logical properties (MIN - left/top, MAX - right/bottom) */
export enum LayoutGridAlignment {
  MIN = 'MIN',
  MAX = 'MAX',
  CENTER = 'CENTER'
}

/** Guides to align and place objects within a frame */
export interface LayoutGrid {
  pattern: LayoutGridPattern;
  /** Width of column grid or height of row grid or square grid spacing */
  sectionSize: number;
  /** Is the grid currently visible? */
  visible: boolean;
  /** Color of the grid */
  color: Color;

  // The following properties are only meaningful for directional grids (COLUMNS or ROWS)

  /** Positioning of grid as a string enum */
  alignment: LayoutGridAlignment;
  /** Spacing in between columns and rows */
  gutterSize: number;
  /** Spacing before the first column or row */
  offset: number;
  /** Number of columns or rows */
  count: number;
}

export enum AxisSizingMode {
  FIXED = 'FIXED',
  AUTO = 'AUTO'
}

export enum EffectType {
  INNER_SHADOW = 'INNER_SHADOW',
  DROP_SHADOW = 'DROP_SHADOW',
  LAYER_BLUR = 'LAYER_BLUR',
  BACKGROUND_BLUR = 'BACKGROUND_BLUR'
}

interface EffectBase {
  /** Is the effect active? */
  visible: boolean;
  /** Radius of the blur effect (applies to shadows as well) */
  radius: number;
}

export interface EffectShadow extends EffectBase {
  type: EffectType.DROP_SHADOW | EffectType.INNER_SHADOW;
  /** The color of the shadow */
  color: Color;
  /** Blend mode of the shadow */
  blendMode: BlendMode;
  /** How far the shadow is projected in the x and y directions */
  offset: Vector;
  /** How far the shadow spreads */
  spread: number;
}

export interface EffectBlur extends EffectBase {
  type: EffectType.BACKGROUND_BLUR | EffectType.LAYER_BLUR;
}

export type Effect = EffectShadow | EffectBlur;

export interface Hyperlink {
  /** Type of hyperlink */
  type: 'URL' | 'NODE';
  /** URL being linked to, if URL type */
  url: string;
  /** ID of frame hyperlink points to, if NODE type */
  nodeID: string;
}

export enum PaintType {
  SOLID = 'SOLID',
  GRADIENT_LINEAR = 'GRADIENT_LINEAR',
  GRADIENT_RADIAL = 'GRADIENT_RADIAL',
  GRADIENT_ANGULAR = 'GRADIENT_ANGULAR',
  GRADIENT_DIAMOND = 'GRADIENT_DIAMOND',
  IMAGE = 'IMAGE',
  EMOJI = 'EMOJI'
}

export enum PaintSolidScaleMode {
  FILL = 'FILL',
  FIT = 'FIT',
  TILE = 'TILE',
  STRETCH = 'STRETCH'
}

export interface PaintBase {
  /** `default: true` Is the paint enabled? */
  visible?: boolean;

  /** `default: 1` Overall opacity of paint (colors within the paint can also have opacity values which would blend with this) */
  opacity?: number;
}

export interface PaintSolid extends PaintBase {
  type: PaintType.SOLID;
  /** Solid color of the paint */
  color: Color;
}

export interface PaintGradient extends PaintBase {
  type:
    | PaintType.GRADIENT_ANGULAR
    | PaintType.GRADIENT_DIAMOND
    | PaintType.GRADIENT_LINEAR
    | PaintType.GRADIENT_RADIAL;
  /** How this node blends with nodes behind it in the scene (see blend mode section for more details) */
  blendMode: BlendMode;
  /**
   * This field contains three vectors, each of which are a position in normalized object space (normalized object space is if the top left corner of the bounding box of the object is (0, 0) and the bottom right is (1,1)).
   * The first position corresponds to the start of the gradient (value 0 for the purposes of calculating gradient stops), the second position is the end of the gradient (value 1), and the third handle position determines the width of the gradient (only relevant for non-linear gradients).
   */
  gradientHandlePositions: Vector[];
  /**
   * Positions of key points along the gradient axis with the colors anchored there.
   * Colors along the gradient are interpolated smoothly between neighboring gradient stops.
   */
  gradientStops: ColorStop[];
}

export interface PaintImage extends PaintBase {
  type: PaintType.IMAGE;
  /** Image scaling mode */
  scaleMode: PaintSolidScaleMode;
  /** Image reference, get it with `Api.getImage` */
  imageRef: string;
  /** Affine transform applied to the image, only present if scaleMode is STRETCH */
  imageTransform?: Transform;
  /** Amount image is scaled by in tiling, only present if scaleMode is TILE */
  scalingFactor?: number;
  /** Image rotation, in degrees. */
  rotation: number;
  /** A reference to the GIF embedded in this node, if the image is a GIF. To download the image using this reference, use the GET file images endpoint to retrieve the mapping from image references to image URLs */
  gifRef: string;
  /**
   * Defines what image filters have been applied to this paint, if any. If this property is not defined, no filters have been applied.
   * @default {}
   */
  filters: ImageFilters;
}

/** A solid color, gradient, or image texture that can be applied as fills or strokes */
export type Paint = PaintSolid | PaintGradient | PaintImage;

/** A 2d vector */
export interface Vector {
  x: number;
  y: number;
}

/** A 2x3 2D affine transformation matrix */
export type Transform = [[number, number, number], [number, number, number]];

export type PageID = number;
export type NodeID = `${number}:${number}`;

export enum PathWindingRule {
  EVENODD = 'EVENODD',
  NONZERO = 'NONZERO'
}

/** A vector svg path */
export interface Path {
  /** A sequence of path commands in SVG notation */
  path: string;
  windingRule: PathWindingRule;
}

/** Defines the image filters applied to an image paint. All values are from -1 to 1, default value is 0. **/
export interface ImageFilters {
  exposure: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  highlights: number;
  shadows: number;
}

/** A relative offset within a frame */
export interface FrameOffset {
  node_id: NodeID;
  /** 2d vector offset within the frame */
  node_offset: Vector;
}

/** A position color pair representing a gradient stop */
export interface ColorStop {
  /** Value between 0 and 1 representing position along gradient axis */
  position: number;
  /** Color attached to corresponding position */
  color: Color;
}

/** Position of a region comment on the canvas **/
export interface Region {
  /** X coordinate of the position **/
  x: number;
  /** Y coordinate of the position **/
  y: number;
  /** The height of the comment region. Must be greater than 0 **/
  region_height: number;
  /** The width of the comment region. Must be greater than 0 **/
  region_width: number;
  /**
   * The corner of the comment region to pin to the node's corner as a string enum
   * @default bottom-right
   */
  comment_pin_corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/** A relative offset region within a frame **/
export interface FrameOffsetRegion {
  /** Unique id specifying the frame. **/
  node_id: string;
  /** 2D vector offset within the frame. **/
  node_offset: Vector;
  /** The height of the comment region **/
  region_height: number;
  /** The width of the comment region **/
  region_width: number;
  /**
   * The corner of the comment region to pin to the node's corner as a string enum
   * @default bottom-right
   */
  comment_pin_corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/** Paint metadata to override default paints **/
export interface PaintOverride {
  /** Paints applied to characters **/
  fills: Paint[];
  /**  ID of style node, if any, that this inherits fill data from **/
  inheritFillStyleId: string;
}

/** Metadata for character formatting */
export interface TypeStyle {
  /** Font family of text (standard name) */
  fontFamily: string;
  /** PostScript font name */
  fontPostScriptName: string;
  /** Space between paragraphs in px, 0 if not present */
  paragraphSpacing?: number;
  /** Paragraph indentation in px, 0 if not present */
  paragraphIndent?: number;
  /**
   * Space between list items in px, 0 if not present *
   * @default 0
   */
  listSpacing: number;
  /** Is text italicized? */
  italic: boolean;
  /** Numeric font weight */
  fontWeight: number;
  /** Font size in px */
  fontSize: number;
  /** Text casing applied to the node, default is the `ORIGINAL` casing */
  textCase?: TextCase;
  /** Text decoration applied to the node, default is `NONE` */
  textDecoration?: TextDecoration;
  /** Dimensions along which text will auto resize, default is that the text does not auto-resize. Default is `NONE` */
  textAutoResize?: TextAutoResize;
  /** Horizontal text alignment as string enum */
  textAlignHorizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED';
  /** Vertical text alignment as string enum */
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
  /** Space between characters in px */
  letterSpacing: number;
  /** Paints applied to characters */
  fills: Paint[];
  /** Link to a URL or frame */
  hyperlink: Hyperlink;
  /** A map of OpenType feature flags to 1 or 0, 1 if it is enabled and 0 if it is disabled. Note that some flags aren't reflected here. For example, SMCP (small caps) is still represented by the textCase field. */
  opentypeFlags: { [flag: string]: number };
  /** Line height in px */
  lineHeightPx: number;
  /** @deprecated Line height as a percentage of normal line height. This is deprecated; in a future version of the API only lineHeightPx and lineHeightPercentFontSize will be returned. */
  lineHeightPercent?: number;
  /** Line height as a percentage of the font size. Only returned when lineHeightPercent is not 100 */
  lineHeightPercentFontSize?: number;
  /** The unit of the line height value specified by the user. */
  lineHeightUnit: LineHeightUnit;
}

/** Data on the frame a component resides in */
export interface FrameInfo {
  nodeId: NodeID;
  /** Name of the frame */
  name: string;
  /** Background color of the frame */
  backgroundColor: string;
  /** ID of the frame's residing page */
  pageId: string;
  /** Name of the frame's residing page */
  pageName: string;
}

/** Data on the "containingStateGroup" a component resides in */
/** Notice: at the moment is not documented in the REST API documentation. I have raised the issue
 *  (https://forum.figma.com/t/missing-containingstategroup-parameter-in-documentation-for-frameinfo/2558)
 *  and filed a bug with the support, but no one replied. From what I understand, this extra parameters are
 *  added when a component is a variant within a component_set (the name/nodeId are of the parent component_set)
 */
export interface ContainingStateGroup {
  /** Name of the element's residing "state group" (likely, a component_set) */
  name: string;
  nodeId: NodeID;
}

/**
 * NOT DOCUMENTED
 *
 * Data on component's containing page, if component resides in a multi-page file
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PageInfo {}

/** An arrangement of published UI elements that can be instantiated across figma files */
export interface Component {
  /** The key of the component */
  key: string;
  /** The name of the component */
  name: string;
  /** The description of the component as typed in the editor */
  description: string;
  /** The ID of the component set if the component belongs to one  */
  componentSetId: string | null;
  /** The documentation links for this component */
  documentationLinks: DocumentationLinks[];
}

/** Represents a link to documentation for a component. */
export interface DocumentationLinks {
  /** Should be a valid URI (e.g. https://www.figma.com). */
  uri: string;
}

/** A set of properties that can be applied to nodes and published. Styles for a property can be created in the corresponding property's panel while editing a file */
export interface Style {
  /** The key of the style */
  key: string;
  /** The name of the style */
  name: string;
  /** The description of the style */
  description: string;
  /** Whether this style is a remote style that doesn't live in this file **/
  remote: boolean;
  /** The type of style */
  styleType: StyleType;
}

export interface ComponentPropertyDefinition {
  /** Type of this component property **/
  type: ComponentPropertyType;
  /** Initial value of this property for instances **/
  defaultValue: boolean | string;
  /** All possible values for this property. Only exists on VARIANT properties **/
  variantOptions?: string[];
  /** List of user-defined preferred values for this property. Only exists on INSTANCE_SWAP properties **/
  preferredValues?: InstanceSwapPreferredValue[];
}

export enum ComponentPropertyType {
  BOOLEAN = 'BOOLEAN',
  INSTANCE_SWAP = 'INSTANCE_SWAP',
  TEXT = 'TEXT',
  VARIANT = 'VARIANT'
}

export interface InstanceSwapPreferredValue {
  /** Type of node for this preferred value **/
  type: 'COMPONENT' | 'COMPONENT_SET';
  /** Key of this component or component set **/
  key: string;
}

export interface ComponentProperty {
  /** Type of this component property **/
  type: ComponentPropertyType;
  /** Value of this property set on this instance **/
  value: boolean | string;
  /** List of user-defined preferred values for this property. Only exists on INSTANCE_SWAP properties **/
  preferredValues?: InstanceSwapPreferredValue[];
}

/** Fields directly overridden on an instance. Inherited overrides are not included. **/
export interface Overrides {
  /** A unique ID for a node **/
  id: string;
  /** An array of properties **/
  overriddenFields: string[];
}

/** The root node */
export interface DocumentNode extends Node<'DOCUMENT'> {
  /** An array of canvases attached to the document */
  children: AnyNode[];
}

/** Represents a single page */
export interface CanvasNode extends Node<'CANVAS'> {
  /** An array of top level layers on the canvas */
  children: AnyNode[];
  /** An array of flow starting points sorted by its position in the prototype settings panel. **/
  flowStartingPoints: FlowStartingPoint[];
  /** Background color of the canvas */
  backgroundColor: Color;
  /**
   * An array of export settings representing images to export from the canvas
   * @default []
   */
  exportSettings: ExportSetting[];
  /** Node ID that corresponds to the start frame for prototypes */
  prototypeStartNodeID?: NodeID | null;
}

/** A node of fixed size containing other nodes */
export interface FrameNode extends Node<'FRAME'> {
  /** An array of nodes that are direct children of this node */
  children: AnyNode[];
  /** If true, layer is locked and cannot be edited, default `false` */
  locked?: boolean;
  /** @deprecated Background of the node. This is deprecated, as backgrounds for frames are now in the fills field. */
  background: Paint[];
  /** @deprecated Background color of the node. This is deprecated, as frames now support more than a solid color as a background. Please use the background field instead. */
  backgroundColor?: Color;
  /** An array of fill paints applied to the node */
  fills: Paint[];
  /** An array of stroke paints applied to the node */
  strokes: Paint[];
  /** The weight of strokes on the node */
  strokeWeight: number;
  /** The weight of strokes on different side of the node */
  individualStrokeWeights?: { top: number; right: number; left: number; bottom: number };
  /** Position of stroke relative to vector outline, as a string enum */
  strokeAlign: StrokeAlign;
  /** Radius of each corner of the frame if a single radius is set for all corners */
  cornerRadius: number;
  /** Array of length 4 of the radius of each corner of the rectangle, starting in the top left and proceeding clockwise */
  rectangleCornerRadii: [number, number, number, number];
  /**
   * An array of export settings representing images to export from node
   * @default []
   */
  exportSettings: ExportSetting[];
  /** How this node blends with nodes behind it in the scene (see blend mode section for more details) */
  blendMode: BlendMode;
  /**
   * Keep height and width constrained to same ratio
   * @default false
   */
  preserveRatio: boolean;
  /** Horizontal and vertical layout constraints for node */
  constraints: LayoutConstraint;
  /** Determines if the layer should stretch along the parent’s counter axis. This property is only provided for direct children of auto-layout frames. */
  layoutAlign: LayoutAlign;
  /**
   * This property is applicable only for direct children of auto-layout frames, ignored otherwise. Determines whether a layer should stretch along the parent’s primary axis. A 0 corresponds to a fixed size and 1 corresponds to stretch.
   * @default: 0
   */
  layoutGrow?: number;
  /**
   * Node ID of node to transition to in prototyping
   * @default: null
   */
  transitionNodeID?: string | null;
  /**
   * The duration of the prototyping transition on this node (in milliseconds).
   * @default: null
   */
  transitionDuration?: number | null;
  /**
   * The easing curve used in the prototyping transition on this node.
   * @default: null
   */
  transitionEasing?: EasingType | null;
  /**
   * Opacity of the node
   * @default 1
   */
  opacity: number;
  /** Bounding box of the node in absolute space coordinates */
  absoluteBoundingBox: Rectangle;
  /** The bounds of the rendered node in the file in absolute space coordinates */
  absoluteRenderBounds: Rectangle;
  /** Width and height of element. This is different from the width and height of the bounding box in that the absolute bounding box represents the element after scaling and rotation. Only present if geometry=paths is passed */
  size?: Vector;
  /** The top two rows of a matrix that represents the 2D transform of this node relative to its parent. The bottom row of the matrix is implicitly always (0, 0, 1). Use to transform coordinates in geometry. Only present if geometry=paths is passed */
  relativeTransform?: Transform;
  /** Does this node clip content outside its bounds? */
  clipsContent: boolean;
  /** Whether this layer uses auto-layout to position its children. default NONE */
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  /** Whether the primary axis has a fixed length (determined by the user) or an automatic length (determined by the layout engine). This property is only applicable for auto-layout frames. Default AUTO */
  primaryAxisSizingMode: AxisSizingMode;
  /** Whether the counter axis has a fixed length (determined by the user) or an automatic length (determined by the layout engine). This property is only applicable for auto-layout frames. Default AUTO */
  counterAxisSizingMode: AxisSizingMode;
  /** Determines how the auto-layout frame’s children should be aligned in the primary axis direction. This property is only applicable for auto-layout frames. Default MIN */
  primaryAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  /** Determines how the auto-layout frame’s children should be aligned in the counter axis direction. This property is only applicable for auto-layout frames. Default MIN */
  counterAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  /**
   * The padding between the left border of the frame and its children. This property is only applicable for auto-layout frames.
   * @default: 0
   */
  paddingLeft: number;
  /**
   * The padding between the right border of the frame and its children. This property is only applicable for auto-layout frames.
   * @default: 0
   */
  paddingRight: number;
  /**
   * The padding between the top border of the frame and its children. This property is only applicable for auto-layout frames.
   * @default: 0
   */
  paddingTop: number;
  /**
   * The padding between the bottom border of the frame and its children. This property is only applicable for auto-layout frames.
   * @default: 0
   */
  paddingBottom: number;
  /** @deprecated default: 0. The horizontal padding between the borders of the frame and its children. This property is only applicable for auto-layout frames. Deprecated in favor of setting individual paddings. */
  horizontalPadding: number;
  /** @deprecated default: 0. The vertical padding between the borders of the frame and its children. This property is only applicable for auto-layout frames. Deprecated in favor of setting individual paddings. */
  verticalPadding: number;
  /**
   * The distance between children of the frame. This property is only applicable for auto-layout frames.
   * @default: 0
   */
  itemSpacing: number;
  /**
   * Applicable only if layoutMode != "NONE"
   * @default: false
.  */
  itemReverseZIndex: boolean;
  /**
   * Applicable only if layoutMode != "NONE"
   * @default: false
. */
  strokesIncludedInLayout: boolean;
  /** Defines the scrolling behavior of the frame, if there exist contents outside the frame boundaries. The frame can either scroll vertically, horizontally, or in both directions to the extents of the content contained within it. This behavior can be observed in a prototype. Default NONE */
  overflowDirection:
    | 'NONE'
    | 'HORIZONTAL_SCROLLING'
    | 'VERTICAL_SCROLLING'
    | 'HORIZONTAL_AND_VERTICAL_SCROLLING';
  /**
   * An array of layout grids attached to this node (see layout grids section for more details). GROUP nodes do not have this attribute
   * @default []
   */
  layoutGrids?: LayoutGrid[];
  /**
   * An array of effects attached to this node (see effects section for more details)
   * @default []
   */
  effects: Effect[];
  /**
   * Does this node mask sibling nodes in front of it?
   * @default false
   */
  isMask: boolean;
  /**
   * Does this mask ignore fill style (like gradients) and effects?
   * @default false
   */
  isMaskOutline: boolean;
  /**
   *
   * @default AUTO
   */
  layoutPositioning: 'AUTO' | 'ABSOLUTE';
}

/** A logical grouping of nodes */
export interface GroupNode extends Omit<FrameNode, 'type'>, Node<'GROUP'> {}

/** A vector network, consisting of vertices and edges */
export interface VectorNode extends Node<'VECTOR'> {
  /**
   * An array of export settings representing images to export from node
   * @default []
   */
  exportSettings: ExportSetting[];
  /** If true, layer is locked and cannot be edited, default `false` */
  locked?: boolean;
  /** How this node blends with nodes behind it in the scene (see blend mode section for more details) */
  blendMode: BlendMode;
  /**
   * Keep height and width constrained to same ratio
   * @default false
   */
  preserveRatio?: boolean;
  /** Determines if the layer should stretch along the parent’s counter axis. This property is only provided for direct children of auto-layout frames. */
  layoutAlign: LayoutAlign;
  /**
   * This property is applicable only for direct children of auto-layout frames, ignored otherwise. Determines whether a layer should stretch along the parent’s primary axis. A 0 corresponds to a fixed size and 1 corresponds to stretch.
   * @default 0
   */
  layoutGrow?: number;
  /** Horizontal and vertical layout constraints for node */
  constraints: LayoutConstraint;
  /**
   * Node ID of node to transition to in prototyping
   * @default null
   */
  transitionNodeID?: string | null;
  /**
   * The duration of the prototyping transition on this node (in milliseconds).
   * @default null
   */
  transitionDuration?: number | null;
  /**
   * The easing curve used in the prototyping transition on this node.
   * @default null
   */
  transitionEasing?: EasingType | null;
  /**
   * Opacity of the node
   * @default 1
   */
  opacity?: number;
  /** Bounding box of the node in absolute space coordinates */
  absoluteBoundingBox: Rectangle;
  /** The bounds of the rendered node in the file in absolute space coordinates */
  absoluteRenderBounds: Rectangle;
  /** Width and height of element. This is different from the width and height of the bounding box in that the absolute bounding box represents the element after scaling and rotation. Only present if geometry=paths is passed */
  size?: Vector;
  /** The top two rows of a matrix that represents the 2D transform of this node relative to its parent. The bottom row of the matrix is implicitly always (0, 0, 1). Use to transform coordinates in geometry. Only present if geometry=paths is passed */
  relativeTransform?: Transform;
  /**
   * An array of effects attached to this node (see effects section for more details)
   * @default []
   */
  effects?: Effect[];
  /**
   * Does this node mask sibling nodes in front of it?
   * @default false
   */
  isMask?: boolean;
  /**
   * An array of fill paints applied to the node
   * @default []
   */
  fills: Paint[];
  /** Only specified if parameter geometry=paths is used. An array of paths representing the object fill */
  fillGeometry?: Path[];
  /**
   * Map from ID to PaintOverride for looking up fill overrides. To see which regions are override, you must use the geometry=paths option.
   * Each path returned may have an overrideId which maps to this table
   */
  fillOverrideTable: Record<number, PaintOverride>;
  /**
   * An array of stroke paints applied to the node
   * @default []
   */
  strokes: Paint[];
  /** The weight of strokes on the node */
  strokeWeight: number;
  /** The weight of strokes on different side of the node */
  individualStrokeWeights?: { top: number; right: number; left: number; bottom: number };
  /**
   * A string describing the end caps of vector paths.
   * @default NONE
   */
  strokeCap?: StrokeCap;
  /** Only specified if parameter geometry=paths is used. An array of paths representing the object stroke */
  strokeGeometry?: Path[];
  /** Where stroke is drawn relative to the vector outline as a string enum */
  strokeAlign: StrokeAlign;
  /** A string enum with value of "MITER", "BEVEL", or "ROUND", describing how corners in vector paths are rendered. */
  strokeJoin?: StrokeJoin;
  /** An array of floating point numbers describing the pattern of dash length and gap lengths that the vector path follows. For example a value of [1, 2] indicates that the path has a dash of length 1 followed by a gap of length 2, repeated. */
  strokeDashes?: number[];
  /** Only valid if strokeJoin is "MITER". The corner angle, in degrees, below which strokeJoin will be set to "BEVEL" to avoid super sharp corners. By default, this is 28.96 degrees. */
  strokeMiterAngle?: number;
  /** A mapping of a StyleType to style ID (see Style) of styles present on this node. The style ID can be used to look up more information about the style in the top-level styles field. */
  styles?: StylesMap;
  /**
   * @default AUTO
   */
  layoutPositioning: 'AUTO' | 'ABSOLUTE';
}

export interface SectionNode
  extends Pick<
      VectorNode,
      'fills' | 'fillGeometry' | 'strokes' | 'strokeWeight' | 'strokeAlign' | 'strokeGeometry'
    >,
    Node<'SECTION'> {
  /** An array of top level layers on the section */
  children: AnyNode[];
}

/** A group that has a boolean operation applied to it */
export interface BooleanNode extends Omit<VectorNode, 'type'>, Node<'BOOLEAN'> {
  /** An array of nodes that are being boolean operated on */
  children: AnyNode[];
}

/** A group that has a boolean operation applied to it */
export interface BooleanOperationNode extends Omit<VectorNode, 'type'>, Node<'BOOLEAN_OPERATION'> {
  /** An array of nodes that are being boolean operated on */
  children: AnyNode[];
  /** A string enum with value of "UNION", "INTERSECT", "SUBTRACT", or "EXCLUDE" indicating the type of boolean operation applied */
  booleanOperation: BooleanOperationType;
}

/** A regular star shape */
export interface StarNode extends Omit<VectorNode, 'type'>, Node<'STAR'> {}

/** A straight line */
export interface LineNode extends Omit<VectorNode, 'type'>, Node<'LINE'> {}

/** An ellipse */
export interface EllipseNode extends Omit<VectorNode, 'type'>, Node<'ELLIPSE'> {
  /** Start and end angles of the ellipse measured clockwise from the x-axis, plus the inner radius for donuts **/
  arcData: ArcData;
}

/** A regular n-sided polygon */
export interface RegularPolygonNode extends Omit<VectorNode, 'type'>, Node<'REGULAR_POLYGON'> {}

/** A rectangle */
export interface RectangleNode extends Omit<VectorNode, 'type'>, Node<'RECTANGLE'> {
  /** Radius of each corner of the rectangle */
  cornerRadius: number;
  /** Array of length 4 of the radius of each corner of the rectangle, starting in the top left and proceeding clockwise */
  rectangleCornerRadii: [number, number, number, number];
}

/** List types are represented as string enums with one of these possible values: ORDERED: Text is an ordered list (numbered), UNORDERED: Text is an unordered list (bulleted), NONE: Text is plain text and not part of any list */
export enum LineTypes {
  ORDERED = 'ORDERED',
  UNORDERED = 'UNORDERED',
  NONE = 'NONE'
}

/** A text box */
export interface TextNode extends Omit<VectorNode, 'fillOverrideTable' | 'type'>, Node<'TEXT'> {
  /** Text contained within text box */
  characters: string;
  /** Style of text including font family and weight (see type style section for more information) */
  style: TypeStyle;
  /** Array with same number of elements as characters in text box, each element is a reference to the styleOverrideTable defined below and maps to the corresponding character in the characters field. Elements with value 0 have the default type style */
  characterStyleOverrides: number[];
  /** The bounds of the rendered node in the file in absolute space coordinates **/
  absoluteRenderBounds: Rectangle;
  /** Map from ID to TypeStyle for looking up style overrides */
  styleOverrideTable: Record<number, TypeStyle>;
  /** An array with the same number of elements as lines in the text node, where lines are delimited by newline or paragraph separator characters. Each element in the array corresponds to the list type of specific line. */
  lineTypes: LineTypes[];
  /** An array with the same number of elements as lines in the text node, where lines are delimited by newline or paragraph separator characters. Each element in the array corresponds to the indentation level of a specific line. */
  lineIndentations: number[];
}

/** A rectangular region of the canvas that can be exported */
export interface SliceNode extends Node<'SLICE'> {
  /** An array of export settings representing images to export from this node */
  exportSettings: ExportSetting[];
  /** Bounding box of the node in absolute space coordinates */
  absoluteBoundingBox: Rectangle;
  /** The bounds of the rendered node in the file in absolute space coordinates */
  absoluteRenderBounds: Rectangle;
  /** Width and height of element. This is different from the width and height of the bounding box in that the absolute bounding box represents the element after scaling and rotation. Only present if geometry=paths is passed */
  size?: Vector;
  /** The top two rows of a matrix that represents the 2D transform of this node relative to its parent. The bottom row of the matrix is implicitly always (0, 0, 1). Use to transform coordinates in geometry. Only present if geometry=paths is passed */
  relativeTransform?: Transform;
}

/** A node that can have instances created of it that share the same properties */
export interface ComponentNode extends Omit<FrameNode, 'type'>, Node<'COMPONENT'> {
  componentPropertyDefinitions: Record<string, ComponentPropertyDefinition>;
}

/** A node that can have instances created of it that share the same properties */
export interface ComponentSetNode extends Omit<FrameNode, 'type'>, Node<'COMPONENT_SET'> {
  componentPropertyDefinitions: Record<string, ComponentPropertyDefinition>;
}

/** An instance of a component, changes to the component result in the same changes applied to the instance */
export interface InstanceNode<ComponentID = string>
  extends Omit<FrameNode, 'type'>,
    Node<'INSTANCE'> {
  /** ID of component that this instance came from, refers to components table (see endpoints section below) */
  componentId: ComponentID;
  /**
   * If true, this node has been marked as exposed to its containing component or component set *
   * @default false
   */
  isExposedInstance: boolean;
  /**
   * IDs of instances that have been exposed to this node's level *
   * @default []
   */
  exposedInstances: string[];
  /**
   * A mapping of name to ComponentProperty for all component properties on this instance. Each property has a type, value, and other optional values (see properties type section below) *
   * @default {}
   */
  componentProperties: Record<string, ComponentProperty>;
  /**
   * An array of all the fields directly overridden on this instance. Inherited overrides are not included. *
   * @default []
   */
  overrides: Overrides[];
}

export type AnyNode =
  | DocumentNode
  | CanvasNode
  | FrameNode
  | GroupNode
  | VectorNode
  | BooleanNode
  | BooleanOperationNode
  | StarNode
  | LineNode
  | EllipseNode
  | RegularPolygonNode
  | RectangleNode
  | TextNode
  | SliceNode
  | ComponentNode
  | ComponentSetNode
  | InstanceNode
  | SectionNode;

export interface Node<Type extends string> {
  id: NodeID;
  /** The name given to the node by the user in the tool. **/
  name: string;
  /**
   * Whether the node is visible on the canvas
   * @default true
   */
  visible: boolean;
  /** The type of the node, refer to table below for details. **/
  type: Type;
  /** Data written by plugins that is visible only to the plugin that wrote it. Requires the `pluginData` to include the ID of the plugin. **/
  pluginData: unknown;
  /** Data written by plugins that is visible to all plugins. Requires the `pluginData` parameter to include the string "shared". **/
  sharedPluginData: unknown;
  isFixed?: boolean;
  /** A mapping of a layer's property to component property name of component properties attached to this node. The component property name can be used to look up more information on the node's containing component's or component set's componentPropertyDefinitions. **/
  componentPropertyReferences: Record<string, string>;
}

export type NodeType = AnyNode['type'];
export type NodeByType<T extends NodeType> = Extract<AnyNode, { type: T }>;

/**
 * ====================
 * Comments, Users, Versions, Projects
 * ====================
 */

/** A comment or reply left by a user */
export interface Comment {
  /** Unique identifier for comment */
  id: string;
  /** The position of the comment. Either the absolute coordinates on the canvas or a relative offset within a frame */
  client_meta: Vector | FrameOffset;
  /** The file in which the comment lives */
  file_key: string;
  /** If present, the id of the comment to which this is the reply */
  parent_id: string;
  /** The user who left the comment */
  user: User;
  /** The UTC ISO 8601 time at which the comment was left */
  created_at: string;
  /** If set, the UTC ISO 8601 time the comment was resolved */
  resolved_at: string;
  /** Only set for top level comments. The number displayed with the comment in the UI */
  order_id?: number;
  /** Comment message */
  message: string;
}

/** A description of a user */
export interface User {
  /** Unique stable id of the user */
  id: string;
  /** Name of the user */
  handle: string;
  /** URL link to the user's profile image */
  img_url: string;
  /** Email associated with the user's account. This will only be present on the /v1/me endpoint */
  email?: string;
}

/** A version of a file */
export interface Version {
  /** Unique identifier for version */
  id: string;
  /** The UTC ISO 8601 time at which the version was created */
  created_at: string;
  /** The label given to the version in the editor */
  label: string;
  /** The description of the version as typed in the editor */
  description: string;
  /** The user that created the version */
  user: User;
}

/** A Project can be identified by both the Project name, and the ProjectID. */
export interface Project {
  /** The ID of the project */
  id: number;
  /** The name of the project */
  name: string;
}

export interface BaseFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface ProjectFile extends BaseFile {
  branches?: BaseFile[];
}

/** An arrangement of published UI elements that can be instantiated across figma files */
export interface ComponentMetadata {
  /** The unique identifier of the component */
  key: string;
  /** The unique identifier of the figma file which contains the component */
  file_key: string;
  /** ID of the component node within the figma file */
  node_id: string;
  /** URL link to the component's thumbnail image */
  thumbnail_url: string;
  /** The name of the component */
  name: string;
  /** The description of the component as typed in the editor */
  description: string;
  /** The UTC ISO 8601 time at which the component was created */
  created_at: string;
  /** The UTC ISO 8601 time at which the component was updated */
  updated_at: string;
  /** The user who last updated the component */
  user: User;
  /** Data on component's containing frame, if component resides within a frame, plus the optional "containingStateGroup" if is a variant of a component_set */
  containing_frame?: FrameInfo & { containingStateGroup?: ContainingStateGroup };
  /** Data on component's containing page, if component resides in a multi-page file */
  containing_page?: PageInfo;
}

/** A node containing a set of variants of a component */
export interface ComponentSetMetadata {
  /** The unique identifier of the component set */
  key: string;
  /** The unique identifier of the figma file which contains the component set */
  file_key: string;
  /** ID of the component set node within the figma file */
  node_id: string;
  /** URL link to the component set's thumbnail image */
  thumbnail_url: string;
  /** The name of the component set */
  name: string;
  /** The description of the component set as typed in the editor */
  description: string;
  /** The UTC ISO 8601 time at which the component set was created */
  created_at: string;
  /** The UTC ISO 8601 time at which the component set was updated */
  updated_at: string;
  /** The user who last updated the component set */
  user: User;
  /** Data on component set's containing frame, if component resides within a frame */
  containing_frame?: FrameInfo;
  /** Data on component set's containing page, if component resides in a multi-page file */
  containing_page?: PageInfo;
}

export interface StyleMetadata {
  /** The unique identifier of the style */
  key: string;
  /** The unique identifier of the file which contains the style */
  file_key: string;
  /** ID of the style node within the figma file */
  node_id: string;
  /** The type of style */
  style_type: StyleType;
  /** URL link to the style's thumbnail image */
  thumbnail_url: string;
  /** Name of the style */
  name: string;
  /** The description of the style as entered by the publisher */
  description: string;
  /** The UTC ISO 8601 time at which the component set was created */
  created_at: string;
  /** The UTC ISO 8601 time at which the style was updated */
  updated_at: string;
  /** The user who last updated the style */
  sort_position: string;
  /** A user specified order number by which the style can be sorted */
  user: User;
}
