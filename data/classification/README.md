# Classification records

One line per grant row, pipe separated:

    id | fields | topics | outputs | purpose | country | origin | stage | age | organisation

- `fields`, `topics`, `outputs` are semicolon separated.
- `fields`, `outputs`, `purpose` and `stage` use the controlled vocabularies in
  `data/vocabulary.json`. A value outside them fails the build.
- `topics` are free text drawn from the corpus, normalised by the build step.
- `-` means not applicable, `?` means the source does not say.

Every line was written by reading that grant's description. Where the text does
not support a value, the value is `?` rather than a guess.
