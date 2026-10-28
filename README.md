# Jay Curayag – Portfolio

Live site: https://jayxzqiox.github.io/FINALPORTFOLIO/

## Folder structure

```
FINALPORTFOLIO/
├── index.html            page content
├── css/
│   └── style.css         all styles and animations
├── js/
│   └── main.js           loader, particles, scroll effects, filters
├── images/
│   ├── favicon.svg       browser tab icon
│   ├── profile/          profile.png
│   └── projects/         project screenshots and photos
└── files/
    └── Jay-Curayag-CV.pdf
```

## Images

All project images are in `images/projects/`:
pos-system, whack-me, woundscan, smart-refill, sumobra, pcb-design,
pos-cpp, foodshare, roots-branches (all .jpg).

Pickle Rush, Driver Drowsiness Detection and ImpactID use animated
illustrations built into index.html, so they need no image.
To swap any image, replace the file and keep the same name.

## Editing projects

Projects live in the `#projects` section of `index.html`.
Featured projects are `<article class="project">` blocks.
Smaller projects are `<article class="card">` blocks; the `data-cat`
attribute (`hardware`, `software`) controls the filter buttons.
