# Poprawki z paczki showroom / listopad 2026

Gałąź `poprawki/showroom-pdf` zawiera zmiany z 48-stronicowej notatki oraz materiały z paczki. Nie zmienia publikowanej gałęzi `main`.

## Wprowadzone zmiany

- Strona główna: nowa kolejność sekcji, podtytuł hero, cytaty klientów, nazwy kategorii, showroom, widoczne opisy usług, zdjęcie procesu, FAQ przed kontaktem, adres i mapa.
- Nawigacja: przycięte logo, większe napisy, przycisk „Umów spotkanie”, pełnoekranowe menu mobilne po przewinięciu, kontakt w menu, obsługa klawiatury.
- O nas i oferta: tekst zespołu, biblioteka próbek, galeria showroomu, zakres i cena konsultacji, poprawki wizualizacji, czas i wycena, zdjęcia 10 i 11.
- Projekty: 39 zdjęć realizacji, nowa kolejność i nazwy kategorii, 12 zdjęć na start oraz „Pokaż więcej”, zdjęcie zespołu w sekcji Podejście. Powiększenie pozwala przeglądać całą aktywną kategorię.
- Blog: usunięte trzy stare teksty; osiem pełnych artykułów autorek z PDF-ów, ilustracje, zdjęcia kart, autorki, data z materiałów (16 listopada 2026), dane strukturalne i mapa strony.
- Formularze: FormSubmit AJAX, walidacja, blokada ponownego wysłania w trakcie żądania, komunikaty sukcesu i błędu, zachowanie danych przy błędzie, pole przeciw spamowi, wynajem w typie inwestycji.
- YouTube ukryty. Link do polityki w stopkach i formularzach. Mapa Google nie łączy się z Google, dopóki odwiedzający nie naciśnie przycisku. Zgodę można wycofać w stopce.

## Do uzupełnienia przed publikacją na main

1. **FormSubmit:** właściciel `studio@artefekt.pl` musi aktywować formularz przez link z wiadomości FormSubmit po pierwszym zgłoszeniu. Następnie należy sprawdzić odbiór testowego zgłoszenia z docelowej domeny. Sam komunikat przyjęcia przez API nie potwierdza doręczenia do skrzynki. Testy kodu nie wysyłają e-maili do właścicielek.
2. **Polityka prywatności:** w paczce zapowiedziano osobną treść, której jeszcze nie dostarczono. Podstrona ma jawny stan „w przygotowaniu” i `noindex`; nie stanowi gotowej polityki. Należy ją zastąpić tekstem od właścicielek, uwzględniającym wybraną usługę formularzy.
3. **Dane firmy:** pełna nazwa rejestrowa i NIP czekają na materiały od właścicielek. W stopce są znane dane studia oraz komentarz oznaczający miejsce uzupełnienia.

## Utrzymanie i podgląd

- FAQ edytuj w `content/faq.json`, następnie uruchom `python scripts/sync-faq.py`. Obie strony mają również statyczną wersję FAQ, widoczną bez JavaScriptu.
- Kolejność kart bloga i metadane: `blog-data.js`.
- Galerie: `projects-data.js`; pierwsza kategoria zawiera 39 realizacji, pozostałe to wizualizacje.
- Podgląd lokalny: `python -m http.server 8765`, następnie `http://127.0.0.1:8765/`.
- Publikacja GitHub Pages nadal działa wyłącznie dla `main`. Sam push tej gałęzi nie zmienia publicznej strony.

## Weryfikacja

- Siedem testów obsługi formularza: `node --test tests/contact.test.cjs`. Obejmują poprawne przyjęcie, odrzucenie, błąd HTTP, brak sieci, nieprawidłową odpowiedź, blokadę podwójnego żądania i walidację/pole przeciw spamowi. Usługa pocztowa jest w testach zastąpiona atrapą.
- Kontrola składni wszystkich plików JavaScript i `git diff --check`.
- Kontrola wszystkich lokalnych odnośników, obrazów i skryptów, unikalności identyfikatorów HTML, danych strukturalnych, ośmiu nowych wpisów, kolejności kategorii i zgodności FAQ z plikiem źródłowym.
- Podgląd w przeglądarce przy szerokości 1440, 390 i 320 px: menu po przewinięciu, widoczność początku artykułu, brak poziomego przepełnienia głównych podstron, filtrowanie i dokładanie zdjęć (12 → 24), powiększenie (24/39 → 25/39), ponowne filtrowanie.
- Sprawdzone ładowanie mapy po zgodzie i usunięcie ramki po wycofaniu zgody.
