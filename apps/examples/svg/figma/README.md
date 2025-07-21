# `@neodx/svg` with exporting from Figma by `@neodx/figma`

This example is based on the [JetBrains Int UI Icons (Community)](<https://www.figma.com/file/qjGIOVF6243bClGjQid2Y5/Int-UI-Icons-(Community)?type=design&node-id=5590-53429&t=Z8UNLvCnALbUxzRA-0>).

I will skip some common steps, if you're interested in details, please check [Simple Figma export example](../../../examples/figma-export-file-assets).

Conditions and requirements (I wanted to export only a part of the icons):

![kit](./docs/kit-overview.png)

- Our icons are placed at: "Icons" page -> "General" section -> "General" and "Tool Windows" frames
- We want to export only visible Component Sets without "20x20" icons
- We want to export only "Light" icons because we can cover dark theme in CSS

So, here is the configuration:

```javascript
const { formatExportFileName } = require('@neodx/figma');
const { cases } = require('@neodx/std');

/**
 * @type {import('@neodx/figma').Configuration}
 */
module.exports = {
  export: {
    fileId:
      'https://www.figma.com/file/qjGIOVF6243bClGjQid2Y5/Int-UI-Icons-(Community)?type=design&node-id=955-20814',
    output: 'assets/icons',
    getExportFileName({ format, node }, root) {
      const componentsSet = root.registry.byId[node.parentId];
      const frame = root.registry.byId[componentsSet.parentId];
      const frameName = cases.kebab(frame.source.name);
      const parentName = cases.kebab(componentsSet.source.name.replace(/^[^/]*\//, '').trim());

      return formatExportFileName(`${frameName}/${parentName}.${format}`);
    },
    collect: {
      target: [
        // Our icons are placed in "Icons" canvas, "General" section and "General" and "Tool Windows" frames
        {
          type: 'CANVAS',
          filter: 'Icons'
        },
        {
          type: 'SECTION',
          filter: 'General'
        },
        {
          type: 'FRAME',
          filter: ['General', 'Tool Windows']
        },
        // Ignoring hidden components and 20x20 components
        {
          type: 'COMPONENT_SET',
          // Ignoring hidden components and 20x20 components
          filter: node => node.source.visible !== false && !node.source.name.includes('20x20')
        },
        {
          type: 'COMPONENT',
          // Ignoring the "Dark" theme, it can be covered by colors in CSS
          filter: 'Light'
        }
      ]
    }
  }
};
```

The result, 145 source SVG icons built into two tiny sprites with generated types and information about the content:

![result](./docs/result-editor.png)

---

![result](./docs/result.png)
