let a = await fetch("https://upscaloro.onrender.com/billing/create-checkout-session", {
    method: "POST",
    headers: n,
    body: JSON.stringify({
        plan_id: t.id,
        price_id: s,
        billing_cycle: e,
        success_url: "".concat(window.location.origin, "/pricing?success=true&plan=").concat(t.id),
        cancel_url: "".concat(window.location.origin, "/pricing?success=false"),
        skip_auth: !x && N
    })
}); 