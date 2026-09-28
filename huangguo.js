/**
 * 黄果 ForwardWidget v1.4
 * API: https://huangguoai.com
 * 封面解密: https://huangg.wulii.de5.net
 * 分类：官方 /api/videos 的 tag 参数无效，题材类一律走 /api/search?q=标签名
 */
WidgetMetadata = {
  id: "forward.huangguoai.tut",
  title: "黄果",
  version: "1.4.3",
  requiredVersion: "0.0.1",
  description: "黄果短剧：分类/搜索/分集播放；题材分类走搜索接口，封面 CF 解密",
  author: "宝宝巴士",
  site: "https://t.me/nostremby",
  detailCacheDuration: 180,
  globalParams: [
    {
      name: "apiBase",
      title: "API 地址",
      type: "input",
      value: "https://huangguoai.com"
    },
    {
      name: "coverProxy",
      title: "封面解密代理",
      type: "input",
      value: "https://huangg.wulii.de5.net"
    },
    {
      name: "coverToken",
      title: "封面代理 Token",
      type: "input",
      value: "hg8f3a2c91b7e04d6a"
    }
  ],
  modules: [
    {
      id: "loadList",
      title: "分类",
      functionName: "loadList",
      cacheDuration: 300,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "tid",
          title: "分类",
          type: "enumeration",
          value: "hot",
          enumOptions: [
            { title: "热门", value: "hot" },
            { title: "最新", value: "new" },
            { title: "排行榜", value: "rank" },
            { title: "AI换脸", value: "kw:AI换脸" },
            { title: "AI魔改", value: "kw:AI魔改" },
            { title: "短剧", value: "kw:短剧" },
            { title: "漫剧", value: "kw:漫剧" },
            { title: "都市", value: "kw:都市" },
            { title: "现代", value: "kw:现代" },
            { title: "校园", value: "kw:校园" },
            { title: "乡村", value: "kw:乡村" },
            { title: "古风", value: "kw:古风" },
            { title: "穿越", value: "kw:穿越" },
            { title: "重生", value: "kw:重生" },
            { title: "系统", value: "kw:系统" },
            { title: "修仙", value: "kw:修仙" },
            { title: "后宫", value: "kw:后宫" },
            { title: "赘婿", value: "kw:赘婿" },
            { title: "逆袭", value: "kw:逆袭" },
            { title: "霸总", value: "kw:霸总" },
            { title: "豪门", value: "kw:豪门" },
            { title: "甜宠", value: "kw:甜宠" },
            { title: "虐恋", value: "kw:虐恋" },
            { title: "熟女", value: "kw:熟女" },
            { title: "乱伦", value: "kw:乱伦" },
            { title: "母子", value: "kw:母子" },
            { title: "人妻", value: "kw:人妻" },
            { title: "巨乳", value: "kw:巨乳" },
            { title: "黑丝", value: "kw:黑丝" },
            { title: "办公室", value: "kw:办公室" }
          ]
        }
      ]
    },
    {
      id: "loadResource",
      title: "播放资源",
      functionName: "loadResource",
      type: "stream",
      cacheDuration: 0,
      params: []
    }
  ],
  search: {
    title: "搜索",
    functionName: "search",
    params: [
      { name: "keyword", title: "关键词", type: "input" },
      { name: "page", title: "页码", type: "page" }
    ]
  }
};

function t(v) {
  return String(v == null ? "" : v).trim();
}

function cfg(params) {
  params = params || {};
  return {
    apiBase: t(params.apiBase || "https://huangguoai.com").replace(/\/+$/, ""),
    coverProxy: t(params.coverProxy || "https://huangg.wulii.de5.net").replace(/\/+$/, ""),
    coverToken: t(params.coverToken || "hg8f3a2c91b7e04d6a")
  };
}

function qs(obj) {
  var parts = [];
  Object.keys(obj || {}).forEach(function (k) {
    if (obj[k] == null || obj[k] === "") return;
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(obj[k])));
  });
  return parts.length ? "?" + parts.join("&") : "";
}

async function httpJson(url) {
  var res = await Widget.http.get(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      Referer: "https://huangguoai.com/"
    }
  });
  var d = res && res.data;
  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch (e) {}
  }
  return d;
}

function absCover(base, cover) {
  cover = t(cover);
  if (!cover) return "";
  if (/^https?:\/\//i.test(cover)) return cover;
  if (cover.indexOf("//") === 0) return "https:" + cover;
  return base + (cover[0] === "/" ? "" : "/") + cover;
}

function proxiedCover(c, encUrl) {
  encUrl = t(encUrl);
  if (!encUrl) return "";
  if (!c.coverProxy) return encUrl;
  var q = { url: encUrl };
  if (c.coverToken) q.token = c.coverToken;
  return c.coverProxy + qs(q);
}

function toItem(c, it) {
  if (!it) return null;
  // 列表用 id；排行榜用 video_id
  var id = t(
    it.id != null
      ? it.id
      : it.video_id != null
        ? it.video_id
        : it.vod_id
  );
  if (!id) return null;
  var title = t(it.title || it.vod_name || it.name);
  var enc = absCover(c.apiBase, it.cover || it.vod_pic || it.pic || "");
  var cover = proxiedCover(c, enc);
  var ep = it.episode_count || it.total_episodes || "";
  var remark = "";
  if (it.is_finished) remark = "全" + (ep || "") + "集";
  else if (ep) remark = "更新至" + ep + "集";
  return {
    id: "hgai:" + id,
    type: "url",
    title: title || id,
    coverUrl: cover,
    posterPath: cover,
    backdropPath: cover,
    description: remark,
    mediaType: "tv",
    link: "hgai:" + id
  };
}

function extractItems(data) {
  if (!data) return [];
  var d = data.data != null ? data.data : data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.items)) return d.items;
  if (Array.isArray(d.list)) return d.list;
  if (Array.isArray(d.results)) return d.results;
  return [];
}

async function fetchBySearch(c, keyword, page, strictTag) {
  keyword = t(keyword);
  page = Number(page || 1) || 1;
  // 多取几页再本地按 tags 过滤，避免模糊搜索串台
  var collected = [];
  var seen = {};
  var maxPage = strictTag ? page + 2 : page; // 严格模式多扫后面页补足
  for (var p = page; p <= maxPage; p++) {
    var data = await httpJson(
      c.apiBase + "/api/search" + qs({ q: keyword, page: p })
    );
    var batch = extractItems(data);
    if (!batch.length) break;
    for (var i = 0; i < batch.length; i++) {
      var it = batch[i];
      var id = t(it.id != null ? it.id : it.video_id);
      if (!id || seen[id]) continue;
      if (strictTag) {
        var tags = it.tags || [];
        var hit = false;
        if (Array.isArray(tags)) {
          for (var j = 0; j < tags.length; j++) {
            if (String(tags[j]) === keyword) { hit = true; break; }
          }
        }
        // 标题以关键词开头也算（如「豪门私教」）
        var title = t(it.title || "");
        if (!hit && title.indexOf(keyword) === 0) hit = true;
        if (!hit) continue;
      }
      seen[id] = 1;
      collected.push(it);
    }
    if (collected.length >= 24) break;
  }
  return collected.slice(0, 24);
}

async function fetchList(c, tid, page) {
  page = Number(page || 1) || 1;
  tid = t(tid) || "hot";
  var items = [];

  if (tid === "rank" || tid === "ranks") {
    try {
      var rank = await httpJson(c.apiBase + "/api/ranks/hot" + qs({ page: page }));
      items = extractItems(rank);
    } catch (e) {}
  }

  if (!items.length && (tid.indexOf("kw:") === 0 || tid.indexOf("tag:") === 0)) {
    var kw = tid.indexOf("kw:") === 0 ? tid.slice(3) : tid.slice(4);
    items = await fetchBySearch(c, kw, page, true);
  }

  if (!items.length && tid !== "hot" && tid !== "new" && tid !== "rank") {
    var legacy = {
      "ai-huanlian": "AI换脸",
      "ai-mogai": "AI魔改",
      "ai-duanju": "短剧",
      "ai-manju": "漫剧",
      dushi: "都市",
      xiandai: "现代",
      xiaoyuan: "校园",
      shunv: "熟女",
      haomen: "豪门",
      hougong: "后宫",
      gufeng: "古风",
      qihuan: "奇幻",
      zhichang: "职场",
      yulequan: "娱乐圈",
      tianchong: "甜宠",
      nianxia: "年下"
    };
    var q = legacy[tid] || tid;
    if (q && q !== "hot" && q !== "new") {
      items = await fetchBySearch(c, q, page, true);
    }
  }

  if (!items.length) {
    var sort = tid === "new" ? "new" : "hot";
    var data = await httpJson(
      c.apiBase + "/api/videos" + qs({ page: page, page_size: 24, sort: sort })
    );
    items = extractItems(data);
  }

  var out = [];
  for (var i = 0; i < items.length; i++) {
    var item = toItem(c, items[i]);
    if (item) out.push(item);
  }
  return out;
}

async function loadList(params) {
  params = params || {};
  return await fetchList(cfg(params), t(params.tid) || "hot", Number(params.page || 1) || 1);
}

async function search(params) {
  params = params || {};
  var c = cfg(params);
  var kw = t(params.keyword);
  if (!kw) return [];
  var page = Number(params.page || 1) || 1;
  var items = await fetchBySearch(c, kw, page, false);
  var out = [];
  for (var i = 0; i < items.length; i++) {
    var item = toItem(c, items[i]);
    if (item) out.push(item);
  }
  return out;
}

function parseLink(link) {
  var s = t(link).replace(/^huangguoai:/, "hgai:");
  if (s.indexOf("hgai:") === 0) s = s.slice(5);
  var parts = s.split(":");
  return { id: t(parts[0]), ep: t(parts[1] || "") };
}

async function loadDetail(link) {
  var p = parseLink(link);
  if (!p.id) return null;
  var c = cfg({});
  var data = await httpJson(c.apiBase + "/api/videos/" + encodeURIComponent(p.id));
  var d = (data && data.data) || {};
  var enc = absCover(c.apiBase, d.cover || "");
  var cover = proxiedCover(c, enc);
  var eps = Array.isArray(d.episodes) ? d.episodes : [];
  var episodeItems = [];
  if (eps.length) {
    for (var i = 0; i < eps.length; i++) {
      var ep = eps[i];
      var n = ep.ep_num || ep.episode || i + 1;
      var epLink = "hgai:" + p.id + ":" + n;
      episodeItems.push({
        id: epLink,
        type: "url",
        title: t(ep.title || "第" + n + "集"),
        mediaType: "tv",
        seasonNumber: 1,
        episodeNumber: Number(n) || i + 1,
        link: epLink,
        videoUrl: "",
        playerType: "app"
      });
    }
  } else {
    episodeItems.push({
      id: "hgai:" + p.id + ":1",
      type: "url",
      title: "第1集",
      mediaType: "tv",
      seasonNumber: 1,
      episodeNumber: 1,
      link: "hgai:" + p.id + ":1",
      videoUrl: "",
      playerType: "app"
    });
  }
  return {
    id: "hgai:" + p.id,
    type: "url",
    title: t(d.title || p.id),
    coverUrl: cover,
    posterPath: cover,
    backdropPath: cover,
    description: t(d.description || ""),
    mediaType: "tv",
    link: "hgai:" + p.id,
    episodeItems: episodeItems
  };
}

async function loadResource(params) {
  params = params || {};
  var c = cfg(params);
  var p = parseLink(t(params.link || params.id || ""));
  if (!p.id) return [];
  var ep = p.ep || t(params.episode) || "1";
  var data = await httpJson(
    c.apiBase +
      "/api/videos/" +
      encodeURIComponent(p.id) +
      "/play" +
      qs({ ep: ep })
  );
  var url = t(
    (data && data.data && data.data.video_url) || (data && data.video_url) || ""
  );
  if (!url) return [];
  return [
    {
      name: "黄果",
      description: "第" + ep + "集",
      url: url,
      playerType: "app",
      customHeaders: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        Referer: "https://huangguoai.com/",
        "X-Forward-Skip-Redirect-Probe": "1"
      }
    }
  ];
}
