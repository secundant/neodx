# @neodx/std

This package contains a set of utilities that are used by other packages in the
`@neodx` namespace.

Currently, is not intended to be used directly by the end user.

But! Let me show one powerful API - `toCase`, all-in-one function for formatting case of strings.

> Inspired by [casex](https://github.com/dxtr-dot-dev/casex)

```typescript
import { toCase } from '@neodx/std';

const str = 'I want_to change-case';

toCase(str, 'ca_se'); // i_want_to_change_case
toCase(str, 'caSe'); // iWantToChangeCase
toCase(str, 'CaSe'); // IWantToChangeCase
toCase(str, 'CA_SE'); // I_WANT_TO_CHANGE_CASE
toCase(str, 'Ca se'); // I want to change case
```

I think you got the idea 🤓
