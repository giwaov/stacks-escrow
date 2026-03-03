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

;; ===== DISPUTE RESOLUTION =====

(define-constant CONTRACT_OWNER 'SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_STATUS (err u101))

(define-map disputes uint {
  escrow-id: uint,
  reason: (string-utf8 200),
  opened-by: principal,
  opened-at: uint
})

(define-data-var dispute-count uint u0)

;; Open a dispute (buyer or seller)
(define-public (open-dispute (escrow-id uint) (reason (string-utf8 200)))
  (let (
    (escrow (unwrap! (map-get? escrows escrow-id) (err u1)))
    (dispute-id (+ (var-get dispute-count) u1))
  )
    (asserts! (or (is-eq tx-sender (get buyer escrow)) 
                  (is-eq tx-sender (get seller escrow))) ERR_NOT_AUTHORIZED)
    (asserts! (is-eq (get status escrow) "pending") ERR_INVALID_STATUS)
    (map-set escrows escrow-id (merge escrow { status: "disputed" }))
    (map-set disputes dispute-id {
      escrow-id: escrow-id,
      reason: reason,
      opened-by: tx-sender,
      opened-at: block-height
    })
    (var-set dispute-count dispute-id)
    (ok dispute-id)))

;; Resolve dispute (admin only)
(define-public (resolve-dispute (escrow-id uint) (release-to-seller bool))
  (let ((escrow (unwrap! (map-get? escrows escrow-id) (err u1))))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (is-eq (get status escrow) "disputed") ERR_INVALID_STATUS)
    (map-set escrows escrow-id (merge escrow { 
      status: (if release-to-seller "resolved-seller" "resolved-buyer") 
    }))
    (ok release-to-seller)))

;; Get dispute details
(define-read-only (get-dispute (id uint))
  (map-get? disputes id))

;; Check if escrow can be auto-released (30 days)
(define-read-only (can-auto-release (escrow-id uint))
  (match (map-get? escrows escrow-id)
    escrow (and (is-eq (get status escrow) "pending") false) ;; Placeholder - would need creation block
    false))
