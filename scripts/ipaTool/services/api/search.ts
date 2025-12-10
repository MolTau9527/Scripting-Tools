import {
  type AppSearchSuccess,
  type SearchAppParams,
} from "../../types/appStore"
import { debounce, currencyCodeToSymbol } from "../../utils"
import { fetch, AbortController } from "scripting"

/**
 * 搜索 App Store 应用
 * @param params 搜索参数
 * @returns 搜索结果数组
 */
export const searchAppIdAbort = { current: () => { } }

export const apiSearchApp = debounce(
  async ({ term, country, entity, limit }: SearchAppParams) => {

    const controller = new AbortController()
    searchAppIdAbort.current = () => {
      controller.abort()
    }
    const response = await fetch(
      `http://itunes.apple.com/search?term=${term}&country=${country}&entity=${entity}&explicit=no&limit=${limit}`,
      { signal: controller.signal }
    )
    const { results } = await response.json()
    console.log("results", results)
    return results.map(
      ({
        trackId,
        trackName,
        artworkUrl60,
        genres,
        version,
        fileSizeBytes,
        averageUserRating,
        userRatingCount,
        minimumOsVersion,
        price,
        description,
        currency,
      }: any) => ({
        id: trackId,
        name: trackName,
        icon: artworkUrl60.replace("60x60bb", "240x240bb"),
        category: genres.join(" • "),
        version,
        size: fileSizeBytes,
        currency,
        price:
          price > 0
            ? `${currencyCodeToSymbol(currency)}${price.toFixed(2)}`
            : "Free",
        averageUserRating: Number((averageUserRating ?? 0).toFixed(1)),
        userRatingCount,
        minimumOsVersion,
        description,
      })
    ) satisfies AppSearchSuccess[] | []
  },
  300,
  { requestAbort: () => searchAppIdAbort.current() }
)


/**
 * 通过 APPID 搜索应用
 * @param appId 应用 ID
 * @param country 国家/地区代码
 * @returns 应用信息
 */

export const appIdSearchAbort = { current: () => { } }
export const apiSearchAppById = debounce(
  async (appId: number, country: string) => {

    const controller = new AbortController()
    appIdSearchAbort.current = () => {
      controller.abort()
    }

    const response = await fetch(
      `http://itunes.apple.com/lookup?id=${appId}&country=${country}`,
      { signal: controller.signal }
    )
    const { results } = await response.json()

    if (!results || results.length === 0) {
      throw new Error("未找到该应用，请检查 APPID 是否正确")
    }

    const [app] = results
    return [
      {
        id: app.trackId,
        name: app.trackName,
        icon: app.artworkUrl60,
        category: app.genres?.join(" • ") || "",
        version: app.version,
        size: app.fileSizeBytes,
        currency: app.currency || "USD",
        price:
          app.price > 0
            ? Number(
              `${currencyCodeToSymbol(app.currency)}${app.price.toFixed(2)}`
            )
            : "Free",
        averageUserRating: Number((app.averageUserRating ?? 0).toFixed(1)),
        userRatingCount: app.userRatingCount || 0,
        minimumOsVersion: app.minimumOsVersion || "",
        description: app.description || "",
      },
    ] satisfies AppSearchSuccess[] | []
  },
  300,
  { requestAbort: () => appIdSearchAbort.current() }
)
