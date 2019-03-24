depo: 581757974.3804477, %: 58175797.43804478, maxDropDown: 40.88
total: 1365, win: 672, lose: 693

const netSpecs: NetSpecs = {
  convolutionLayers: [
    {
      type: LayerType.ConvolutionKohonen,
      size: [8, 4, 4],
      step: 2,
    },
    {
      type: LayerType.ConvolutionKohonen,
      size: [12, 4],
      step: 2,
    },
    {
      type: LayerType.ConvolutionKohonen,
      size: [16, 4],
      step: 2,
    },
  ],
  // unionLayer: {
  //   type: LayerType.UnionKohonen,
  //   size: 20,
  // },
}
