// store of all themed color settings
// keep consistent with theming/_colors.scss

// bt white_black gradient
const bt_white =                  "#ffffff";
const bt_off_white =              "#f2f2f2";
const bt_border_white =           "#eaeaea";

const bt_light_gray =             "#b0b0b0";
const bt_dark_gray =              "#606060";

const bt_border_black =           "#414141";
const bt_off_black =              "#373737";
const bt_black =                  "#222222";

// bt text colors
const bt_text_white =             "#e8e8e8";
const bt_text_white_light =       "#c1c1c1";
const bt_text_white_faded =       "#717171";

const bt_text_black_faded =       "#969696";
const bt_text_black_light =       "#535353";
const bt_text_black =             "#383838";

// bt colors =  blue green pink yellow
const bt_blue =                   "#2f80ed";
const bt_green =                  "#18DE83";
const bt_pink =                   "#F85386";
const bt_yellow =                 "#FFFF00";

// bt variants =  primary, danger
const bt_primary_light =  "#4287e1";
const bt_primary =        "#1e72e1";
const bt_primary_faded =  "#1a61bf";

const bt_danger_light =  "#de5c5c";
const bt_danger =        "#dc3333";
const bt_danger_faded =  "#b62727";

const bt_cardinal_light =         "#ae3535";
const bt_cardinal =               "#8c1515";
const bt_cardinal_faded =         "#6d1414";

const themed_colors = {
  "light": {
    "white": bt_white,
    "off_white": bt_off_white,
    "border_white": bt_border_white,
    "light_gray": bt_light_gray,

    
    "text_base": bt_text_black,
    "text_light": bt_text_black_light,
    "text_faded": bt_text_black_faded,

    "blue": bt_blue,

    "primary": bt_primary,
    "primary_light": bt_primary_light,
    "primary_faded": bt_primary_faded,
    "primary_highlight": bt_white,
    "primary_inverted": bt_white,
    "primary_inverted_light": bt_white,
    "primary_inverted_faded": bt_off_white,
    "primary_inverted_highlight": bt_primary,
    "danger": bt_danger,
    "danger_light": bt_danger_light,
    "danger_faded": bt_danger_faded,
    "danger_highlight": bt_white,
    "danger_inverted": bt_white,
    "danger_inverted_light": bt_white,
    "danger_inverted_faded": bt_off_white,
    "danger_inverted_highlight": bt_danger,
  },
  "dark": {
    "white": bt_black,
    "off_white": bt_off_black,
    "border_white": bt_border_black,
    "light_gray": bt_dark_gray,

    "text_base": bt_text_white,
    "text_light": bt_text_white_light,
    "text_faded": bt_text_white_faded,

    "blue": bt_blue,

    "primary": bt_primary,
    "primary_light": bt_primary_light,
    "primary_faded": bt_primary_faded,
    "primary_highlight": bt_white,
    "primary_inverted": bt_black,
    "primary_inverted_light": bt_black,
    "primary_inverted_faded": bt_off_black,
    "primary_inverted_highlight": bt_primary,
    "danger": bt_danger,
    "danger_light": bt_danger_light,
    "danger_faded": bt_danger_faded,
    "danger_highlight": bt_white,
    "danger_inverted": bt_black,
    "danger_inverted_light": bt_black,
    "danger_inverted_faded": bt_off_black,
    "danger_inverted_highlight": bt_danger,
  },
  "stanfurd": {
    "white": bt_white,
    "off_white": bt_off_white,
    "border_white": bt_border_white,
    "light_gray": bt_light_gray,
    
    "text_base": bt_text_black,
    "text_light": bt_text_black_light,
    "text_faded": bt_text_black_faded,

    "blue": bt_cardinal,

    "primary": bt_cardinal,
    "primary_light": bt_cardinal_light,
    "primary_faded": bt_cardinal_faded,
    "primary_highlight": bt_white,
    "primary_inverted": bt_white,
    "primary_inverted_light": bt_white,
    "primary_inverted_faded": bt_off_white,
    "primary_inverted_highlight": bt_cardinal,
    "danger": bt_danger,
    "danger_light": bt_danger_light,
    "danger_faded": bt_danger_faded,
    "danger_highlight": bt_white,
    "danger_inverted": bt_white,
    "danger_inverted_light": bt_white,
    "danger_inverted_faded": bt_off_white,
    "danger_inverted_highlight": bt_danger,
  },
}

export default themed_colors;