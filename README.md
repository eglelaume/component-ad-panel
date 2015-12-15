# component-ad-panel

## Props and defaults:

 * `animated={true}` (boolean): when the ad enters the screen, it animates upwards.
 * `adTag` (required string): The DFP tag this points to. Often in the format of a URL. example: `/5605/foo.bar/qux/x`.
 * `className` (string): Add this className to ad-panel__container.
 * `lazyLoad={true}` (boolean): Don't load the ad until it's close to the screen.
 * `lazyLoadMargin={350}` (number of px): How close to the screen does the ad need to be to be loaded by `lazyLoad`.
 * ```
  sizes={[
      [ 60, 60 ],
      [ 70, 70 ],
      [ 300, 250 ],
      [ 1024, 768 ]
    ]}
  ``` (array of pairs of advertisement width, height): what ad sizes can be loaded. Is used as the `size` argument to [googletag.defineSlot](https://developers.google.com/doubleclick-gpt/reference#googletag.defineSlot)
 * ```
 sizeMapping={[
        [[980, 200], [[1024, 768]]],
        [[0, 0], [[300, 250]]],
      ]}
      ``` (array of pairs of screen sizes [ width, height ] and advertisement sizes [ [width1, height1], [width2, height2], ... ] ): Each element in this array results in a call to [sizeMapping().addSize](https://developers.google.com/doubleclick-gpt/reference#googletag.SizeMappingBuilder_addSize)
 * `targeting` (array of pairs of key/value strings): Defines the ad targeting. Each element corresponds to a call to [setTargeting](https://developers.google.com/doubleclick-gpt/reference#googletag.PassbackSlot_setTargeting)
 * `reserveHeight` (number of px): Sets a min-height to the ad, so as to avoid content jumps when the ad eventually comes around.
 * `googletag` (instance of the googletag object): Mostly a testing hook, but can be passed to avoid loading the DFP tag again, if it was already loaded.

## Relevant reading:

 * [The window.googletag API](https://developers.google.com/doubleclick-gpt/reference)
 * [understanding sizeMappings](https://support.google.com/dfp_premium/answer/3423562)

