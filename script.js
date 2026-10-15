// Each download panel names its GitHub repo (data-repo). Pull that repo's latest release so the
// version, download links and file size update on their own whenever a new release is published.
// The static hrefs in the HTML (the release page) stay as a fallback if the API is unreachable.

async function loadLatestRelease(panel) {
  const repo = panel.dataset.repo;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!res.ok) return; // rate-limited / offline → keep the static fallback

    const data = await res.json();
    const assets = (data.assets || []).filter(a => a.name.toLowerCase().endsWith(".apk"));

    const verEl = panel.querySelector('[data-field="version"]');
    if (verEl && data.tag_name) verEl.textContent = `Latest release · ${data.tag_name}`;

    // Every link with data-asset points at the release file whose name contains that text.
    panel.querySelectorAll("[data-asset]").forEach((link, i) => {
      const asset = assets.find(a => a.name.includes(link.dataset.asset));
      if (!asset) return;
      link.href = asset.browser_download_url;
      link.setAttribute("download", asset.name);
      // The first (main) download decides the size shown in the specs.
      if (i === 0) {
        const sizeEl = panel.querySelector('[data-field="size"]');
        if (sizeEl && asset.size) sizeEl.textContent = (asset.size / 1048576).toFixed(1) + " MB";
      }
    });
  } catch (e) {
    // Network error — the page already has working links to the release page.
  }
}

document.querySelectorAll(".dl-panel[data-repo]").forEach(loadLatestRelease);
