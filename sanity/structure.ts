import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem("ingredients").title("Ingredients"),
      S.documentTypeListItem("users").title("Users"),
      S.documentTypeListItem("dishes").title("Dishes"),
      S.documentTypeListItem("orders").title("Orders"),
      S.documentTypeListItem("reviews").title("Reviews"),
    ])
