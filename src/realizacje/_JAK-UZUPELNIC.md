# Strony realizacji – jak uzupełnić treść

Każdy projekt ma własną stronę: `src/realizacje/<projekt>.html` (np. `willa-w-tarnowie.html`).
Na stronie są już zdjęcia, nazwa, kategoria, miejscowość i rok. Resztę treści dopisuje klient.

## Gdzie wpisać tekst

Na samej górze pliku jest blok `<!-- @vars { … } -->`. Wystarczy wpisać tekst między cudzysłowy.
**Puste pole nie pokazuje się na stronie** – można uzupełniać stopniowo, nic nie „wisi” pustego.

| Pole | Co to jest | Gdzie widać na stronie |
|---|---|---|
| `NAZWA` | Nazwa projektu | Tytuł strony, okruszki, Google |
| `LOKALIZACJA` | Miejscowość / dzielnica | Tabelka obok tytułu |
| `ROK` | Rok realizacji (wymagany) | Tabelka obok tytułu |
| `METRAZ` | Powierzchnia, np. `68 m²` | Tabelka |
| `ZAKRES` | Zakres prac, np. `Projekt koncepcyjny i wykonawczy, nadzór` | Tabelka |
| `CZAS` | Czas realizacji, np. `4 miesiące` | Tabelka |
| `OPIS` | 1–3 zdania wstępu o projekcie | Pod tytułem, po lewej |
| `ZALOZENIA` | Czego chcieli inwestorzy, jakie były ograniczenia | Sekcja „Założenia” pod dużym zdjęciem |
| `ROZWIAZANIE` | Co zaprojektowaliśmy i dlaczego | Sekcja „Rozwiązanie” |
| `CYTAT` + `CYTAT_AUTOR` | Prawdziwa opinia klienta (za jego zgodą) i podpis, np. `Anna i Piotr, inwestorzy` | Duży cytat nad linkami do innych realizacji |
| `ZDJECIA_AUTOR` | Autor zdjęć | Podpis pod galerią |

Nie zmieniaj pól `NAV`, `CAT` i `KATEGORIA` – ustawiają menu i kategorię.

Tekst wpisuje się jako zwykły tekst (bez HTML). Cudzysłów w środku tekstu pisz jako „…” (polskie), nie `"`.

Po wpisaniu opisu warto też poprawić `<meta name="description">` w tym pliku, tak żeby w Google pokazywał się opis projektu.

## Zdjęcia

Zdjęcia projektu leżą w `src/img/realizacje/<skrót>/` jako `01.jpg`, `02.jpg`, … (dłuższy bok ok. 1200 px).
`01.jpg` to duże zdjęcie na górze strony; pozostałe układają się w galerię w kolejności numerów.
Dodanie lub usunięcie zdjęcia wymaga zmiany galerii w pliku strony – najprościej poprosić Claude: „dodaj zdjęcia 10–12 do strony Willa w Tarnowie”.

## Nowy projekt

Poproś Claude: „dodaj nową realizację <nazwa>, kategoria <…>, zdjęcia są w <folder>”. Powstanie strona,
karta na stronie Realizacje i w kategorii, a strona sama trafi do mapy strony dla Google.
