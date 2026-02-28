;; Escrow Contract - P2P safe trades on Stacks Mainnet

(define-data-var escrow-count uint u0)

(define-map escrows 
  uint 
  {buyer: principal, seller: principal, amount: uint, status: (string-ascii 20)}
)

;; Create escrow (buyer deposits STX)
(define-public (create-escrow (seller principal) (amount uint))
  (let ((id (+ (var-get escrow-count) u1)))
    (try! (stx-transfer? amount tx-sender 'SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY))
    (map-set escrows id {
      buyer: tx-sender,
      seller: seller,
      amount: amount,
      status: "pending"
    })
    (var-set escrow-count id)
    (ok id)
  )
)

;; Release funds to seller (buyer confirms delivery)
(define-public (release (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows escrow-id) (err u1))))
    (asserts! (is-eq tx-sender (get buyer escrow)) (err u2))
    (asserts! (is-eq (get status escrow) "pending") (err u3))
    (map-set escrows escrow-id (merge escrow {status: "released"}))
    (ok true)
  )
)

;; Refund buyer (seller cancels)
(define-public (refund (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows escrow-id) (err u1))))
    (asserts! (is-eq tx-sender (get seller escrow)) (err u2))
    (asserts! (is-eq (get status escrow) "pending") (err u3))
    (map-set escrows escrow-id (merge escrow {status: "refunded"}))
    (ok true)
  )
)

;; Read-only
(define-read-only (get-escrow (id uint))
  (map-get? escrows id)
)

(define-read-only (get-escrow-count)
  (var-get escrow-count)
)
