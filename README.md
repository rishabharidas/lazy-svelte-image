# lazy-image-loader


A custom Image component/tag like component with customizations, loader ...

## Installing the Package

If you're seeing this, you've probably already done this step. Congrats!

```bash
npm i lazy-svelte-image
```

## Usage

Once you've installed you can import the package and use just like ```<img>``` . an exaple is given below

```bash
import { Image } from 'lazy-svelte-image'


<Image src="" alt="" />

# or

<Image> <!-- slot--> </Image>
```


## Customization

Currenlty you can provide custom loader and broken image icon as slot. use slot like how you use it in svelte.

  ### Props

  - <code>disableLoader</code> - disable all loaders
  - <code>disableBroken</code> - disable all broken view
  - <code>backgroundColor</code> - set custom background color for default broken/loader

  ### Slots

  #### For custom broken Images/Icons

  ```bash
  <span slot="boken">
    <!-- provide code here -->
  </span>
  ```
  #### For custom Loaders

  ```bash
  <span slot="loader">
    <!-- provide loader code here  -->
  </span>
  ```


##### Looking forward for feature requests and usages 😃..