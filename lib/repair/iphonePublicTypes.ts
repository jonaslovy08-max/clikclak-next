export type IphoneMainRepair = {
  name: string
  subtitle: string
  price: string
}

export type IphoneOtherRepair = {
  name: string
  price: string
}

export type IphoneModel = {
  id: string
  label: string
  generation: string
  image: string
  mainRepairs: IphoneMainRepair[]
  otherRepairs: IphoneOtherRepair[]
}

export type IphoneGeneration = {
  id: string
  label: string
}

export type IphonePublicPageData = {
  iphoneModels: IphoneModel[]
  generations: IphoneGeneration[]
}
