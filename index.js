const puppeteer = require('puppeteer');

// 여기에 id, pw, 블로그 글주소 복붙
const naver_id = '';
const naver_pw = '';
const blog_id = '';
const log_no = '';
const sympathy_url = `https://m.blog.naver.com/SympathyHistoryList.naver?blogId=${blog_id}&logNo=${log_no}&categoryId=POST`;

try {
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  // 로그인
  const page = await browser.newPage();
  await page.goto('https://nid.naver.com/nidlogin.login');
  await page.evaluate((id, pw) => {
    document.querySelector('#id').value = id;
    document.querySelector('#pw').value = pw;
  }, naver_id, naver_pw);
  await page.click('.btn_login');
  await page.waitForNavigation();

  // 공감한 이웃 id 목록
  await page.goto(sympathy_url);
  const id_list = await page.evaluate(() => {
    const result = [];
    const a_list = document.querySelectorAll('ul .link__D9GoZ');
    a_list.forEach((a => a.href && result.push(a.href)));
    return result.map((url => url.replace('https://m.blog.naver.com/', '')));
  });
  console.log(id_list);

  // 이웃추가
  id_list.forEach(async (id) => {
    const nPage = await browser.newPage();
    await nPage.goto(`https://m.blog.naver.com/BuddyAddForm.naver?blogId=${id}`);
    const buddyRadio = await nPage.$('#bothBuddyRadio:not([disabled])');

    // 서로이웃 추가가 가능하면 추가하고 아니면 닫음
    if (buddyRadio) {
        await buddyRadio.click();
        await nPage.click('.btn_ok');
    } else {
        nPage.close();
    }
  });

  // await browser.close();
})();
} catch (e) {
  console.log(e);
}