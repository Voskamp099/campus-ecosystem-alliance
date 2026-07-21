import { pool, isDatabaseAvailable, invalidateDbCache } from "../db.js";
import { getDefaultItems, DEFAULT_SITE_CONTENT } from "../defaults.js";
import { logger } from "../utils/logger.js";

const ALLOWED_SECTIONS = new Set([
  "hero_carousel",
  "categories",
  "category_details",
  "recruit",
  "events",
  "partners",
  "directory"
]);

const ALLOWED_PARTNER_GROUPS = new Set(["university", "company", "government"]);
const ALLOWED_DIRECTORY_GROUPS = new Set(["campus", "government", "company"]);
const ALLOWED_CATEGORY_DETAIL_GROUPS = new Set(["food-fun", "lifestyle", "study-life", "career-startup"]);

function normalizeGroup(sectionKey, groupKey) {
  if (sectionKey === "partners") {
    if (!ALLOWED_PARTNER_GROUPS.has(groupKey)) throw new Error("无效的合作伙伴分组");
    return groupKey;
  }
  if (sectionKey === "category_details") {
    if (!ALLOWED_CATEGORY_DETAIL_GROUPS.has(groupKey)) throw new Error("无效的资源分类详情分组");
    return groupKey;
  }
  if (sectionKey === "directory") {
    if (!ALLOWED_DIRECTORY_GROUPS.has(groupKey)) throw new Error("无效的生态对接名录分组");
    return groupKey;
  }
  return null;
}

export function assertValidSection(sectionKey, groupKey = null) {
  if (!ALLOWED_SECTIONS.has(sectionKey)) {
    throw new Error("无效的栏目类型");
  }
  return normalizeGroup(sectionKey, groupKey);
}

function mapRowToItem(row) {
  if (row.section_key === "partners") {
    return {
      id: row.id,
      name: row.partner_name || row.title,
      type: row.partner_type || row.meta,
      logo: row.logo_url || row.image_url
    };
  }

  let items = [];
  try {
    items = row.items_json ? JSON.parse(row.items_json) : [];
  } catch (error) {
    items = [];
  }

  return {
    id: row.id,
    title: row.title,
    meta: row.meta,
    desc: row.description || "",
    image: row.image_url || "",
    link: row.link_url || "",
    items,
    slug: row.slug || ""
  };
}

function mapInputToRow(sectionKey, payload, sortOrder, groupKey) {
  if (sectionKey === "partners") {
    return [
      sectionKey,
      groupKey,
      payload.name || payload.title || "",
      payload.type || payload.meta || "",
      "",
      payload.logo || payload.image || "",
      "",
      null,
      "",
      payload.name || payload.title || "",
      payload.type || payload.meta || "",
      payload.logo || payload.image || "",
      sortOrder
    ];
  }

  return [
    sectionKey,
    groupKey,
    payload.title || "",
    payload.meta || "",
    payload.desc || "",
    payload.image || "",
    payload.link || "",
    JSON.stringify(Array.isArray(payload.items) ? payload.items : []),
    payload.slug || "",
    "",
    "",
    "",
    sortOrder
  ];
}

async function seedIfEmpty(sectionKey, groupKey = null) {
  if (!(await isDatabaseAvailable())) return;
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM content_items WHERE section_key = ? AND group_key <=> ?",
      [sectionKey, groupKey]
    );

    if (rows[0]?.count > 0) return;

    const defaults = getDefaultItems(sectionKey, groupKey);
    if (!defaults.length) return;
    await replaceSection(sectionKey, groupKey, defaults);
  } catch (dbErr) {
    logger.warn({ err: dbErr, sectionKey, groupKey }, "seedIfEmpty \u5931\u8d25\uff0c\u8df3\u8fc7\u79cd\u5b50\u6570\u636e");
    invalidateDbCache();
  }
}

export async function listContent(sectionKey, groupKey = null) {
  const normalizedGroup = assertValidSection(sectionKey, groupKey);
  if (!(await isDatabaseAvailable())) {
    return getDefaultItems(sectionKey, normalizedGroup);
  }
  try {
    await seedIfEmpty(sectionKey, normalizedGroup);
    const [rows] = await pool.query(
      "SELECT * FROM content_items WHERE section_key = ? AND group_key <=> ? ORDER BY sort_order ASC, id ASC",
      [sectionKey, normalizedGroup]
    );
    return rows.map(mapRowToItem);
  } catch (dbErr) {
    logger.warn({ err: dbErr, sectionKey, groupKey: normalizedGroup }, "listContent \u67e5\u8be2\u5931\u8d25\uff0c\u964d\u7ea7\u5230\u9ed8\u8ba4\u6570\u636e");
    invalidateDbCache();
    return getDefaultItems(sectionKey, normalizedGroup);
  }
}

export async function getSiteContent() {
  if (!(await isDatabaseAvailable())) {
    const defaults = DEFAULT_SITE_CONTENT;
    return {
      heroCarousel: defaults.heroCarousel,
      categories: defaults.categories,
      categoryDetails: defaults.categoryDetails,
      recruit: defaults.recruit,
      events: defaults.events,
      partners: {
        university: defaults.partners.university,
        company: defaults.partners.company,
        government: defaults.partners.government
      },
      directory: {
        campus: defaults.directory.campus,
        government: defaults.directory.government,
        company: defaults.directory.company
      }
    };
  }

  const [heroCarousel, categories, recruit, events, university, company, government, directoryCampus, directoryGovernment, directoryCompany] = await Promise.all([
    listContent("hero_carousel"),
    listContent("categories"),
    listContent("recruit"),
    listContent("events"),
    listContent("partners", "university"),
    listContent("partners", "company"),
    listContent("partners", "government"),
    listContent("directory", "campus"),
    listContent("directory", "government"),
    listContent("directory", "company")
  ]);

  const categoryDetailsEntries = await Promise.all(
    Array.from(ALLOWED_CATEGORY_DETAIL_GROUPS).map(async slug => [slug, await listContent("category_details", slug)])
  );

  return {
    heroCarousel,
    categories,
    categoryDetails: Object.fromEntries(categoryDetailsEntries),
    recruit,
    events,
    partners: {
      university,
      company,
      government
    },
    directory: {
      campus: directoryCampus,
      government: directoryGovernment,
      company: directoryCompany
    }
  };
}

export async function createContent(sectionKey, groupKey, payload) {
  const normalizedGroup = assertValidSection(sectionKey, groupKey);
  const items = await listContent(sectionKey, normalizedGroup);
  const rowValues = mapInputToRow(sectionKey, payload, items.length, normalizedGroup);
  const [result] = await pool.query(
    `INSERT INTO content_items (
      section_key, group_key, title, meta, description, image_url, link_url, items_json, slug,
      partner_name, partner_type, logo_url, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    rowValues
  );
  const [rows] = await pool.query("SELECT * FROM content_items WHERE id = ?", [result.insertId]);
  return mapRowToItem(rows[0]);
}

export async function updateContent(id, payload) {
  const [existingRows] = await pool.query("SELECT * FROM content_items WHERE id = ?", [id]);
  const existing = existingRows[0];
  if (!existing) {
    throw new Error("内容不存在");
  }

  const sectionKey = existing.section_key;
  const rowValues = mapInputToRow(sectionKey, payload, existing.sort_order, existing.group_key);
  await pool.query(
    `UPDATE content_items SET
      section_key = ?, group_key = ?, title = ?, meta = ?, description = ?, image_url = ?, link_url = ?, items_json = ?,
      slug = ?, partner_name = ?, partner_type = ?, logo_url = ?, sort_order = ?
    WHERE id = ?`,
    [...rowValues, id]
  );
  const [rows] = await pool.query("SELECT * FROM content_items WHERE id = ?", [id]);
  return mapRowToItem(rows[0]);
}

export async function deleteContent(id) {
  const [existingRows] = await pool.query("SELECT * FROM content_items WHERE id = ?", [id]);
  const existing = existingRows[0];
  if (!existing) {
    throw new Error("内容不存在");
  }

  await pool.query("DELETE FROM content_items WHERE id = ?", [id]);

  const [rows] = await pool.query(
    "SELECT id FROM content_items WHERE section_key = ? AND group_key <=> ? ORDER BY sort_order ASC, id ASC",
    [existing.section_key, existing.group_key]
  );
  await reorderContent(existing.section_key, existing.group_key, rows.map(row => row.id));
}

export async function reorderContent(sectionKey, groupKey, ids) {
  const normalizedGroup = assertValidSection(sectionKey, groupKey);
  if (!Array.isArray(ids) || !ids.length) return;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (let index = 0; index < ids.length; index += 1) {
      await connection.query(
        "UPDATE content_items SET sort_order = ? WHERE id = ? AND section_key = ? AND group_key <=> ?",
        [index, ids[index], sectionKey, normalizedGroup]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function replaceSection(sectionKey, groupKey, items) {
  const normalizedGroup = assertValidSection(sectionKey, groupKey);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      "DELETE FROM content_items WHERE section_key = ? AND group_key <=> ?",
      [sectionKey, normalizedGroup]
    );
    for (let index = 0; index < items.length; index += 1) {
      await connection.query(
        `INSERT INTO content_items (
          section_key, group_key, title, meta, description, image_url, link_url, items_json, slug,
          partner_name, partner_type, logo_url, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        mapInputToRow(sectionKey, items[index], index, normalizedGroup)
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function exportAllContent() {
  const siteContent = await getSiteContent();
  return {
    alliance_content_hero_carousel: siteContent.heroCarousel,
    alliance_content_categories: siteContent.categories,
    "alliance_content_category_details_food-fun": siteContent.categoryDetails["food-fun"] || [],
    alliance_content_category_details_lifestyle: siteContent.categoryDetails.lifestyle || [],
    "alliance_content_category_details_study-life": siteContent.categoryDetails["study-life"] || [],
    "alliance_content_category_details_career-startup": siteContent.categoryDetails["career-startup"] || [],
    alliance_content_recruit: siteContent.recruit,
    alliance_content_events: siteContent.events,
    alliance_logos_university: siteContent.partners.university,
    alliance_logos_company: siteContent.partners.company,
    alliance_logos_government: siteContent.partners.government,
    alliance_directory_campus: siteContent.directory.campus,
    alliance_directory_government: siteContent.directory.government,
    alliance_directory_company: siteContent.directory.company
  };
}

export async function importAllContent(payload) {
  const importMap = [
    ["alliance_content_hero_carousel", "hero_carousel", null],
    ["alliance_content_categories", "categories", null],
    ["alliance_content_category_details_food-fun", "category_details", "food-fun"],
    ["alliance_content_category_details_lifestyle", "category_details", "lifestyle"],
    ["alliance_content_category_details_study-life", "category_details", "study-life"],
    ["alliance_content_category_details_career-startup", "category_details", "career-startup"],
    ["alliance_content_recruit", "recruit", null],
    ["alliance_content_events", "events", null],
    ["alliance_logos_university", "partners", "university"],
    ["alliance_logos_company", "partners", "company"],
    ["alliance_logos_government", "partners", "government"],
    ["alliance_directory_campus", "directory", "campus"],
    ["alliance_directory_government", "directory", "government"],
    ["alliance_directory_company", "directory", "company"]
  ];

  for (const [inputKey, sectionKey, groupKey] of importMap) {
    if (Object.prototype.hasOwnProperty.call(payload, inputKey)) {
      const value = Array.isArray(payload[inputKey]) ? payload[inputKey] : [];
      await replaceSection(sectionKey, groupKey, value);
    }
  }
}
