import { renderPage } from "./layout.js";
import { homePage } from "./pages/home.js";
import { roviqPage } from "./pages/roviq.js";
import { stationPage } from "./pages/station.js";
import { connectionPage } from "./pages/connection.js";
import { aboutPage } from "./pages/about.js";
import { contactPage } from "./pages/contact.js";
import { ukrainePage } from "./pages/ukraine.js";
import { getVehicleInventory, searchVehicleInventory, getVehicleImageResponse, getPublicInventoryHealth, syncVehicleInventory } from "./inventory.js";
import { createBooking, listBookings, updateBooking, bookingsAdminPage } from "./booking.js";
import { vehicleAdminPage, syncNow } from "./admin-vehicles.js";
import { pricingAdminPage, savePricing } from "./admin-pricing.js";
import { costingAdminPage } from "./admin-costing.js";
import { listCoreCases, coreCasesAdminPage } from "./core.js";
import { operationsDashboard, operationCasePage } from "./ops.js";
import {
  handleAdminGet,
  handleAdminLogin,
  handleAdminLogout,
  handleAdminSave,
  handleAdminResetField,
  handleAdminUpload,
  handleUploadedAsset,
  loadAllContent,
  isAuthed
} from "./admin.js";

function redirectTo(request, path, status=302) {
  return Response.redirect(new URL(path, request.url).toString(), status);
}

function secureHeaders(extra={}) {
  return {
    "x-content-type-options":"nosniff",
    "x-frame-options":"DENY",
    "referrer-policy":"strict-origin-when-cross-origin",
    "permissions-policy":"camera=(), microphone=(), geolocation=()",
    "cross-origin-opener-policy":"same-origin",
    ...extra
  };
}

const PAGES = {
  "/": {
    render: homePage,
    title: "Roviq & Roviq Station — One system, two forms",
    description: "Roviq Core is one backend feeding role-based apps for auto services. Roviq Station is one physical hub bringing fuel, EV charging, café, retail, and wash together. Same architecture, applied twice."
  },
  "/roviq": {
    render: roviqPage,
    title: "Roviq — Maintenance. Anywhere.",
    description: "Roviq Core is the coordination layer connecting diagnosis, repair capacity, dealerships, towing, and mobility into one connected automotive service experience."
  },
  "/station": {
    render: stationPage,
    title: "Roviq Station — A Luxury Experience, at an Affordable Price",
    description: "Fuel, EV charging, café, curated wine and retail, and a car wash — one independent brand, one location, staged across a clear Tier 1/2/3 roadmap."
  },
  "/roviq-x-station": {
    render: connectionPage,
    title: "Roviq × Roviq Station — Where the platform meets the hub",
    description: "One backend, many front ends. One hub, many services. How Roviq and Roviq Station connect on the ground."
  },
  "/about": {
    render: aboutPage,
    title: "About — Roviq & Roviq Station",
    description: "The founder story and team behind Roviq and Roviq Station."
  },
  "/contact": {
    render: contactPage,
    title: "Contact — ROVIQ",
    description: "Contact ROVIQ about investment, partnerships, press, brochure requests, locations, technology or general enquiries."
  }
,
  "/ukraine": {
    render: ukrainePage,
    title: "ROVIQ — U.S. Vehicle Selection for Ukraine",
    description: "Dealer-sourced U.S. trucks for Ukraine. Prices, availability, vehicle history and specifications require confirmation before purchase."
  }
};

export default {
  async scheduled(controller, env, ctx) {
    // Dealer refresh runs from the GitHub runner, which can reach dealer inventory
    // endpoints reliably and publishes the verified snapshot to Cloudflare KV.
    return;
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method;

    try {
      if (path === "/admin") {
        if (method === "GET") return handleAdminGet(request, env);
        return new Response("Method not allowed", { status: 405 });
      }
      if (path === "/admin/login" && method === "POST") return handleAdminLogin(request, env);
      if (path === "/admin/logout" && method === "POST") return handleAdminLogout(request, env);
      if (path === "/admin/save" && method === "POST") return handleAdminSave(request, env);
      if (path === "/admin/reset-field" && method === "POST") return handleAdminResetField(request, env);
      if (path === "/admin/upload" && method === "POST") return handleAdminUpload(request, env);
      if (path.startsWith("/uploads/") && method === "GET") return handleUploadedAsset(request, env);
      if (path.startsWith("/ukraine/image/") && method === "GET") return getVehicleImageResponse(request, env);
      if (path === "/ukraine/book" && method === "POST") return createBooking(request, env);
      if (path === "/ukraine/request" && method === "GET") {
        const inventory=await getVehicleInventory(env);
        const selected=inventory.vehicles.find(v=>v.id===url.searchParams.get("vehicle"))||(!url.searchParams.has("vehicle")?inventory.vehicles[0]:null);
        const content=await loadAllContent(env);
        const body=ukrainePage(content,{...inventory,vehicles:selected?[selected]:[]},null,null,true);
        return new Response(renderPage({
          title:"ROVIQ — Request a Vehicle",
          description:"Request a vehicle from ROVIQ's U.S. inventory for Ukraine.",
          activePath:"/ukraine",body
        }),{status:selected||!inventory.vehicles.length?200:404,headers:secureHeaders({"content-type":"text/html;charset=UTF-8","cache-control":"no-store"})});
      }

      if (path === "/api/vehicles" && method === "GET") {
        return Response.json(searchVehicleInventory(await getVehicleInventory(env),url.searchParams), {
          headers: secureHeaders({ "cache-control": "no-store", "access-control-allow-origin": "*" })
        });
      }

      if (path === "/api/inventory-health" && method === "GET") {
        return Response.json(await getPublicInventoryHealth(env), {
          headers: secureHeaders({ "cache-control": "no-store", "access-control-allow-origin": "*" })
        });
      }

      if (path === "/admin/pricing") {
        if (!(await isAuthed(request, env))) return redirectTo(request, "/admin", 302);
        if (method === "GET") return new Response(await pricingAdminPage(env), { headers: secureHeaders({ "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" }) });
        return new Response("Method not allowed", { status: 405 });
      }
      if (path === "/admin/pricing/save" && method === "POST") {
        if (!(await isAuthed(request, env))) return new Response("Unauthorized", { status: 401 });
        return savePricing(request, env);
      }

      if (path === "/admin/costing") {
        if (!(await isAuthed(request, env))) return redirectTo(request, "/admin", 302);
        if (method === "GET") return new Response(await costingAdminPage(env), { headers: secureHeaders({ "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" }) });
        return new Response("Method not allowed", { status: 405 });
      }

      if (path === "/admin/vehicles") {
        if (!(await isAuthed(request, env))) return redirectTo(request, "/admin", 302);
        if (method === "GET") return new Response(await vehicleAdminPage(env), { headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" } });
        return new Response("Method not allowed", { status: 405 });
      }
      if (path === "/admin/vehicles/sync" && method === "POST") {
        if (!(await isAuthed(request, env))) return new Response("Unauthorized", { status: 401 });
        return syncNow(env);
      }
      if (path === "/admin/bookings") {
        if (!(await isAuthed(request, env))) return redirectTo(request, "/admin", 302);
        if (method === "GET") return new Response(bookingsAdminPage(await listBookings(env)), { headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" } });
        return new Response("Method not allowed", { status: 405 });
      }
      if (path === "/admin/bookings/status" && method === "POST") {
        if (!(await isAuthed(request, env))) return new Response("Unauthorized", { status: 401 });
        return updateBooking(request, env);
      }

      if (path === "/admin/core-cases") {
        if (!(await isAuthed(request, env))) return redirectTo(request, "/admin", 302);
        if (method === "GET") return new Response(coreCasesAdminPage(await listCoreCases(env)), { headers: secureHeaders({ "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" }) });
        return new Response("Method not allowed", { status: 405 });
      }

      if (path === "/ops") {
        if (!(await isAuthed(request, env))) return redirectTo(request, "/admin", 302);
        if (method === "GET") return new Response(await operationsDashboard(env), { headers: secureHeaders({ "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" }) });
        return new Response("Method not allowed", { status: 405 });
      }
      if (path === "/ops/case") {
        if (!(await isAuthed(request, env))) return redirectTo(request, "/admin", 302);
        if (method === "GET") return new Response(await operationCasePage(env,url.searchParams.get("id")||""), { headers: secureHeaders({ "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" }) });
        return new Response("Method not allowed", { status: 405 });
      }

      const page = PAGES[path];
      if (page && method === "GET") {
        const content = await loadAllContent(env);
        const inventory = path === "/ukraine" ? searchVehicleInventory(await getVehicleInventory(env),url.searchParams) : null;
        if(path === "/ukraine"){
          // Serve the last verified external-sync snapshot. Do not scrape dealers
          // from the Cloudflare request path; blocked dealer egress can shrink KV.
        }
        const bookingId = path === "/ukraine" ? url.searchParams.get("booking") : null;
        const unavailableId = path === "/ukraine" ? url.searchParams.get("unavailable") : null;
        const body = path === "/ukraine" ? page.render(content, inventory, bookingId, unavailableId,false,url.searchParams) : page.render(content);
        const html = renderPage({
          title: page.title,
          description: page.description,
          activePath: path,
          body
        });
        return new Response(html, {
          headers: secureHeaders({ "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" })
        });
      }

      if (method === "GET" && env.ASSETS) {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) return assetResponse;
      }

      return new Response("Not found", { status: 404 });
    } catch (err) {
      return new Response(`Internal error: ${err.message}`, { status: 500 });
    }
  }
};
