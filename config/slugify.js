//
// Count in the DB if there is the same Starting name Slug
const countSlug = async (Where, inData) => {
  const count = await Where.count({
    slug: new RegExp(`^${slugify(inData)}.*$`),
  });
  return count;
};

// Compare if the same slug is in DB
const compareSlugs = async (Where, inData) => {
  const posts = await Where.find();
  inData = slugify(inData);
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].slug === inData) {
      return true;
    }
  }
  return false;
};

// Slugify a string
const slugify = (str) => {
  str = str.replace(/^\s+|\s+$/g, "");

  // Make the string lowercase
  str = str.toLowerCase();

  // Remove accents, swap ñ for n, etc
  var from =
    "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
  var to =
    "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  // Remove invalid chars
  str = str
    .replace(/[^a-z0-9 -]/g, "")
    // Collapse whitespace and replace by -
    .replace(/\s+/g, "-")
    // Collapse dashes
    .replace(/-+/g, "-");

  return str;
};

const finalizeSlug = async (Where, title, slug) => {
  // If no Slug
  if (!slug) {
    if (title === "Untitled Post" || title) {
      // if there is no slug in DB with starting title
      if ((await countSlug(Where, title)) === 0) return slugify(title);
      // if the slugs in DB and want to save are the same ...
      else if (await countSlug(Where, title)) {
        // if there is the same slug in DB for not having unique error
        if (
          await compareSlugs(
            Where,
            `${slugify(title)}-${(await countSlug(Where, title)) + 1}`
          )
        ) {
          // We're going to plus it more than 1
          const howMany = (await countSlug(Where, title)) + 1;
          return `${slugify(title)}-${howMany + 1}`;
        }

        // if they are not exactly the same + 1 the countSlug function
        else {
          return `${slugify(title)}-${(await countSlug(Where, title)) + 1}`;
        }
      }
    }
  }
  // If there is a slug
  else {
    // if there is no slug in DB with starting slug
    if ((await countSlug(Where, slug)) === 0) return slugify(slug);
    // if the slugs in DB and want to save are the same ...
    else if (await countSlug(Where, slug)) {
      // if there is the same slug in DB for not having unique error
      if (
        await compareSlugs(
          Where,
          `${slugify(slug)}-${(await countSlug(Where, slug)) + 1}`
        )
      ) {
        // We're going to plus it more than 1
        const howMany = (await countSlug(Where, slug)) + 1;
        return `${slugify(slug)}-${howMany + 1}`;
      }

      // if they are not exactly the same + 1 the countSlug function
      else {
        return `${slugify(slug)}-${(await countSlug(Where, slug)) + 1}`;
      }
    }
  }
};

module.exports.slugify = slugify;
module.exports.finalizeSlug = finalizeSlug;
