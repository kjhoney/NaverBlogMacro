const puppeteer = require('puppeteer');

// 여기에 id, pw, 블로그 글주소, 신청내용 복붙
const naver_id = '';
const naver_pw = '';
const post_url = 'https://blog.naver.com/kiti817/222983317744';
const requestContent = `안녕하세요 :)
호랑이띠 아기와 함께하는 육아블로그 운영하고 있어용
이웃님 글 통해서 알게 되어 서이추 신청하고 갑니당!
답방은 꼭 가요 함께 소통해요💗`;

const [blog_id, log_no] = post_url.replace('https://blog.naver.com/', '').split('/');
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
        await nPage.$eval('.textarea_t1', el => el.value = '');
        await nPage.type('.textarea_t1', requestContent);
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