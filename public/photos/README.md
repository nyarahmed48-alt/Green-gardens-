# Photographs

The page ships with gradient placeholders in the venue's own colours. This is
how you replace them with real pictures. Two steps: drop the files in here,
then name them in `src/content.ts`.

You can do one at a time. Anything you have not filled in stays a gradient, so
the page never looks half-finished while you work through them.

## 1. Put the files here

```
public/photos/hero.jpg
public/photos/story.jpg
public/photos/garden-1.jpg   … up to garden-6.jpg
```

The names are only a suggestion — whatever you use has to match step 2.

**Sizes.** Longest edge about **1600px**, JPEG, and aim for **under 300KB
each**. Bigger than that and a guest on phone data waits, which costs you more
than the extra sharpness gains. `squoosh.app` does this in a browser, free.

**Shapes.** They are cropped to fill, so the subject wants to be near the
middle:

| Slot | Shape |
| --- | --- |
| `hero` | tall, 4:5 |
| `story` | landscape, 5:4 |
| `garden-1` … `garden-6` | square, 1:1 |

**Shoot at dusk or under lights.** The page is near-black, and a bright midday
photograph punches a white hole in it. Evening pictures — lamps in the trees,
the glass house lit from inside — sit on this design far better.

## 2. Name them in `src/content.ts`

Find the photo block at the bottom of the `GARDEN` object:

```ts
  heroPhoto: undefined as Photo | undefined,
  storyPhoto: undefined as Photo | undefined,
  gallery: [] as Photo[],
```

Replace what you are filling in:

```ts
  heroPhoto: {
    src: "/photos/hero.jpg",
    alt: {
      ar: "التراس مساءً، طاولات مرتبة تحت أشجار الزيتون",
      ckb: "تەراس لە ئێوارەدا، مێزەکان لە ژێر دار زەیتوونەکاندا ڕێکخراون",
      en: "The Terrace at dusk, tables set under the olive trees",
    },
  },
```

And for the gallery, as many as you have, up to six:

```ts
  gallery: [
    { src: "/photos/garden-1.jpg", alt: { ar: "…", ckb: "…", en: "…" } },
    { src: "/photos/garden-2.jpg", alt: { ar: "…", ckb: "…", en: "…" } },
  ],
```

`src` always starts with `/photos/` — that is the URL the browser asks for, not
the folder path on your computer.

**Alt text is required, in all three languages.** On this page the photographs
*are* the sales pitch, so describe what is actually in the frame. "A photo of
the garden" helps nobody; "the glass house lit from inside, tables set for
forty" helps someone who cannot see it, and helps Google too.
