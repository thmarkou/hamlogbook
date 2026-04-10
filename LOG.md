# HamLogbook — ημερολόγιο ανάπτυξης

## 2026-04-10

### UI και πλοήγηση (Expo Router)

- Αρχική οθόνη (Dashboard): μαύρο φόντο, κάρτες στατιστικών, πλοήγηση σε `/log-qso`, `/qso-list`, `/stats`. Zustand `useDashboardStatsStore` με `syncFromDatabase` από SQLite.
- Log QSO: segments για Band/Mode, χωριστά πεδία RST, χρώματα `#000000` και `#3B82F6`. Αποθήκευση σε SQLite και Zustand· μετά το save γίνεται `router.back()`.
- QSO Log: `FlatList`, κάρτες, νεότερα QSO πρώτα, `loadQSosFromDatabase`, banner σφάλματος, κουμπί Share (Lucide) για ADIF.
- Statistics: κάρτες όπως στο home, ενότητες Bands και Modes με ετικέτες (tags), δεδομένα από Zustand.

### SQLite

- Πίνακας `qsos` με πεδία: id, callsign, band, mode, rst_sent, rst_rcvd, frequency, grid, notes, timestamp.
- Migration από παλιό σχήμα (χωριστά RST, grid_square).
- Αρχικοποίηση στο `getDatabase()` με μηνύματα `console.log` / `console.error` (αγγλικά).
- Ενημερωμένο `SQLiteQSORepository` (save, findAll, mapRowToQSO).
- Φόρτωση Zustand κατά την εκκίνηση από `HydrateQSOStoreFromSQLite` στο `app/_layout.tsx`.

### ADIF

- Αρχείο `src/features/adif/exportToADIF.ts`: κεφαλίδα ADIF και πεδία CALL, BAND, MODE, QSO_DATE, TIME_ON, RST_SENT, RST_RCVD, FREQ, GRIDSQUARE, NOTES, EOR.
- Εγγραφή `.adi` με `expo-file-system` και κοινή χρήση με `expo-sharing`.

### Εικονίδιο / splash

- `assets/hamlogbook.png` στο `app.json` και ενημέρωση iOS assets.

### Cursor

- Κανόνας `.cursor/rules/user-facing-chat-format.mdc`.

### Σημειώσεις

- `findAll` μέσω `getAllAsync`.
- Εξαρτήσεις: `expo-file-system`, `expo-sharing`, `react-native-svg`, `lucide-react-native`.
- Οθόνη λίστας QSO: `app/qso-list/index.tsx` (διαγράφηκε το `qso-list.tsx`). Η διαδρομή `/qso-list` παραμένει.

---

Τελευταία ενημέρωση: 10 Απριλίου 2026
