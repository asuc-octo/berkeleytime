# chartist-plugin-tooltip

Implements a tooltip for [Chartist](https://github.com/gionkunz/chartist-js) charts.

## Install

As styles are very different with each project, no CSS is included. You can copy paste this to use as base:

```scss
.ct-tooltip {
    position: absolute;
    display: inline-block;
    min-width: 5em;
    padding: 8px 10px;
    background: #383838;
    color: #fff;
    text-align: center;
    pointer-events: none;
    z-index: 100;
    transition: opacity .2s linear;

    // Arrow
    &:before {
        position: absolute;
        bottom: -14px;
        left: 50%;
        border: solid transparent;
        content: ' ';
        height: 0;
        width: 0;
        pointer-events: none;
        border-color: rgba(251, 249, 228, 0);
        border-top-color: #383838;
        border-width: 7px;
        margin-left: -8px;
    }

    &.hide {
        display: block;
        opacity: 0;
        visibility: hidden;
    }
}
```

## Usage

In an example chart:

```js
new Chartist.Bar('.ct-chart', data, {
        stackBars: true,
        plugins: [
            Chartist.plugins.tooltip({
                valueTransform: function () {
                    return (value / 1000) + 'k';
                }
            })
        ]
    }
});
```

| __Option__ | __Description__ | __Type__ | __Default__ |
| ---        | ---             | ---      | ---         |
| `valueTransform` | Format value with callback. Allows html. | `string` | `null` |
| `seriesName` | Show the name of the series in the tooltip. | `bool` | `true` |

## Changelog

# 0.0.11
- Fix module loading.