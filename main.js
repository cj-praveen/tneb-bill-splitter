import * as cheerio from 'cheerio';

async function fetch_details(url, service_number, phone_number, captcha_code, viewState, cookie) {
    const payload = new FormData();
    payload.append("id", "id");
    payload.append("serviceno", service_number);
    payload.append("mob", phone_number);
    payload.append("cap", captcha_code);
    payload.append("submit3", "Submit");
    if (viewState) {
        payload.append("javax.faces.ViewState", viewState);
    }
    const headers = {};
    if (cookie) {
        headers["Cookie"] = cookie;
    }
    const request = await fetch(url, { method: "POST", body: payload, headers: headers });
    const response = await request.text();


    const $ = cheerio.load(response);

    const latest_bill = $('table.ccbills').eq(1).find("tr").eq(3).find('td').map((i, el) => $(el).text().trim()).get();

    return latest_bill ? latest_bill : [];
}

async function scrapper() {
    const url = "https://www.tnebltd.gov.in/BillStatus/billstatus.xhtml";
    const request = await fetch(url, { method: "GET" });
    const cookie = request.headers.get("set-cookie");
    const response = await request.text();

    const $ = cheerio.load(response);

    const form = $("form");
    let form_url = form.attr("action");
    let captcha_image = form.find("#imgCaptchaId").attr("src");
    let viewState = form.find('input[name="javax.faces.ViewState"]').val();

    if (form_url) {
        form_url = new URL(form_url, url).href;
    }

    if (captcha_image) {
        captcha_image = new URL(captcha_image, url).href;
    }

    return {
        form_url: form_url,
        captcha_image: captcha_image,
        viewState: viewState,
        cookie: cookie
    }
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default {
    async fetch(req, env, ctx) {
        if (req.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        const path = new URL(req.url).pathname;

        if (path == "/api/session" && req.method === "GET") {
            try {
                const data = await scrapper();
                if (data.form_url && data.captcha_image && data.viewState) {
                    return Response.json(data, { headers: corsHeaders });
                } else {
                    return Response.json({ error: "Failed to scrape session data" }, { status: 500, headers: corsHeaders });
                }
            } catch (err) {
                return Response.json({ error: "Server error" }, { status: 500, headers: corsHeaders });
            }
        }

        if (path == "/api/bill" && req.method === "POST") {
            try {
                const contentType = req.headers.get("content-type") || "";
                let data;
                if (contentType.includes("application/json")) {
                    const json = await req.json();
                    data = new FormData();
                    for (const key in json) {
                        data.append(key, json[key]);
                    }
                } else {
                    data = await req.formData();
                }

                if (data.has("form_url") && data.has("serviceno") && data.has("mob") && data.has("cap") && data.has("javax.faces.ViewState")) {
                    const result = await fetch_details(data.get("form_url"), data.get("serviceno"), data.get("mob"), data.get("cap"), data.get("javax.faces.ViewState"), data.get("cookie"));

                    if (result && result.length > 0) {
                        return Response.json({
                            totalunits: parseFloat(result[7] || "0"),
                            totalamount: parseFloat(result[17] || "0"),
                            unitcharges: parseFloat(result[8] || "0"),
                            extracharges: parseFloat((parseFloat(result[9] || 0) + parseFloat(result[10] || 0) + parseFloat(result[11] || 0) + parseFloat(result[12] || 0)).toFixed(2)),
                            fixedcharges: parseFloat(result[13] || "0")
                        }, { headers: corsHeaders });
                    }
                }
                return Response.json({ error: "Invalid form data or failed to fetch details" }, { status: 400, headers: corsHeaders });
            } catch (err) {
                return Response.json({ error: "Server error" }, { status: 500, headers: corsHeaders });
            }
        }

        return new Response("Not found", { status: 404, headers: corsHeaders });
    }
};