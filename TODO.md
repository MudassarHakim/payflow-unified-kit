# NetBanking Search Improvements

- [x] Modify NetBankingPayment.tsx to add useRef for input field
- [x] Update useEffect to only search when searchTerm.length >= 3 or empty
- [x] After loadBanks completes, set focus back to input field
- [x] Verify mock bank list uses standard Indian banks (already done)

# Card Payment Security Enhancements

- [x] Implement CVV masking in CardPayment component
- [x] Add visual mask overlay for CVV input field
- [x] Maintain actual CVV value for processing while displaying masked version
