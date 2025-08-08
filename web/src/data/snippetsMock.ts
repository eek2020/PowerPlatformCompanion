export type Snippet = {
  id: string
  title: string
  tags: string[]
  code: string
  explanation?: string
}

export const snippetsMock: Snippet[] = [
  {
    id: 'fx-filter-search',
    title: 'Filter and Search a Gallery (delegation-safe where possible)',
    tags: ['Power Fx', 'delegation', 'gallery'],
    code: "Filter(Contacts, StartsWith(FirstName, txtSearch.Text) || StartsWith(LastName, txtSearch.Text))",
    explanation: 'Basic StartsWith-based search over Contacts by first/last name.'
  },
  {
    id: 'fx-patch-form',
    title: 'Patch a Form to Dataverse',
    tags: ['Power Fx', 'Dataverse', 'patch'],
    code: "Patch(Contacts, Defaults(Contacts), { FirstName: txtFirst.Text, LastName: txtLast.Text })",
  },
  {
    id: 'fx-date-adddays',
    title: 'Date math (add days)',
    tags: ['Power Fx', 'datetime'],
    code: "DateAdd(Today(), -5, Days)",
  }
]
