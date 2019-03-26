depo: 1310476620.0784874, %: 131047662.00784874, maxDropDown: 65.46
total: 1431, win: 710, lose: 721

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
