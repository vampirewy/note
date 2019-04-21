const OSS = require("ali-oss");
const chalk = require("chalk");
const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");

/**
 * looger工具
 */
const logger = {
  error(text) {
    console.log(`${chalk.red("[error]")}${text}`);
  },
  info(text) {
    console.log(`${chalk.blue("[info]")}${text}`);
  },
  success(text) {
    console.log(`${chalk.green("[success]")}${text}`);
  }
};
/**
 * bucket 配置
 */
const STATIC_OSS = "oyoyo-static";
const BACKUP_OSS = "oyoyo-backup";
const client = initOSS({
  // accessKeyId: "LTAILtcGo9YqIgXs",
  // accessKeySecret: "pdJffWpm9n4PzwMfUc7gIcfXXXKRCF"
});
const [projectName, bukectName, dist] = process.argv.slice(2);

/**
 * 初始化OSS服务器
 * @param {Object} config
 */
function initOSS(options) {
  let config = Object.assign({}, options);
  return new OSS(config);
}

async function checkOptions(rollback) {
  //检查bucket
  try {
    await client.getBucketInfo(bukectName);
  } catch (error) {
    logger.error(`Bucket: ${bukectName} 不存在`);
    throw new Error(error);
  }
  if (rollback) {
    let bucket = client.useBucket(bukectName);
    const files = await bucket.list({
      prefix: `${projectName}/`
    });
    if (!files.objects) {
      logger.error(`线上不存在 ${projectName}`);
      process.exit(0);
    }
  } else {
    //检查项目文件
    const dist_path = path.join(dist);
    const project_path = path.join(dist, projectName);
    if (!fs.existsSync(dist_path)) {
      logger.error(`构建文件夹 ${dist_path} 不存在`);
      process.exit(0);
    }
    if (!fs.existsSync(project_path)) {
      logger.error(`本地不存在 ${projectName} `);
      process.exit(0);
    }
  }
}

/**
 * 上传代码
 */
async function upload() {
  let bucket = null;
  let files_assets = await fg(path.join(dist, "assets", projectName, "**"), {
    absolute: true
  });
  let files_html = await fg(path.join(dist, projectName, "**"), {
    absolute: true
  });
  files_assets = files_assets.map(item => {
    return {
      oss_path: item.slice(item.indexOf(projectName)),
      local_path: item
    };
  });
  files_html = files_html.map(item => {
    return {
      oss_path: item.slice(item.indexOf(projectName)),
      local_path: item
    };
  });
  bucket = await client.useBucket(bukectName);
  const files_html_online = await bucket.list({
    prefix: `${projectName}/`
  });
  //当线上项目存在时才备份
  if (files_html_online.objects) {
    logger.info(`切换到${BACKUP_OSS}桶`);
    bucket = await client.useBucket(BACKUP_OSS);
    logger.info(`开始备份线上${projectName}的html文件`);
    try {
      for (let i = 0; i < files_html_online.objects.length; i++) {
        const file = files_html_online.objects[i].name;
        await bucket.copy(`${bukectName}/${file}`, `/${bukectName}/${file}`);
      }
    } catch (error) {
      logger.error(`html文件备份失败`);
      throw new Error(error);
    }
    logger.success(`html文件备份成功`);
  }

  //开始上传assets文件
  logger.info(`切换到${STATIC_OSS}桶`);
  bucket = await client.useBucket(STATIC_OSS);
  logger.info(`开始上传assets文件`);
  try {
    for (let i = 0; i < files_assets.length; i++) {
      const file = files_assets[i];
      await bucket.put(file.oss_path, file.local_path);
    }
  } catch (error) {
    logger.error(`assets文件上传失败`);
    throw new Error(error);
  }
  logger.success(`assets文件上传成功`);

  //开始上传html文件
  logger.info(`切换到${bukectName}桶`);
  bucket = await client.useBucket(bukectName);
  logger.info(`开始上传html文件`);
  try {
    for (let i = 0; i < files_html.length; i++) {
      const file = files_html[i];
      await bucket.put(file.oss_path, file.local_path);
    }
  } catch (error) {
    logger.error(`html文件上传失败`);
    throw new Error(error);
  }
  logger.success(`html文件上传成功`);
}
/**
 * 项目回滚
 */
async function rollback() {
  let bucket = null;
  logger.info(`切换到${BACKUP_OSS}桶`);
  bucket = await client.useBucket(BACKUP_OSS);
  const files_html_backup = await bucket.list({
    prefix: `${bukectName}/${projectName}/`
  });
  if (files_html_backup.objects) {
    logger.success(`成功得到项目：${projectName}的备份文件`);
  } else {
    logger.error(`没有项目：${projectName}的备份文件`);
    process.exit(0);
  }
  logger.info(`切换到${bukectName}桶`);
  bucket = await client.useBucket(bukectName);
  logger.info(`开始回滚项目：${projectName}`);
  try {
    for (let i = 0; i < files_html_backup.objects.length; i++) {
      /**
       * 得到以下文件后需要把前缀 oyoyo-test/ 去除
       * oyoyo-test/baseFrame/200.html
       * oyoyo-test/baseFrame/index.html
       */
      const file = files_html_backup.objects[i].name;
      await bucket.copy(
        file.slice(file.indexOf(projectName)),
        `/${BACKUP_OSS}/${file}`
      );
    }
  } catch (error) {
    logger.error("回滚失败");
    throw new Error(error);
  }
  logger.success("成功回滚");
}

async function run() {
  if (dist === "--rollback") {
    await checkOptions("rollback");
    await rollback();
  } else {
    await checkOptions();
    await upload();
  }
}

run();
