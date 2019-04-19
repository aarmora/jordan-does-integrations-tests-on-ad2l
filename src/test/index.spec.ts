import puppeteer, { Browser, Page } from 'puppeteer';
import { getPropertyBySelector, setUpNewPage, getPropertyByHandle } from 'puppeteer-helpers';
import { expect } from 'chai';

describe('Base page layout', () => {
    let browser: Browser;
    let page: Page;

    before(async () => {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
    });

    after(async () => {
        await browser.close();
    });

    it('should have 7 tabs if not signed in', async () => {
        const url = 'https://dota.playon.gg/seasons';
        await page.goto(url);

        await page.waitForSelector('ul.nav > li');
        const tabs = await page.$$('ul.nav > li');

        expect(tabs.length).to.equal(7);
    });

    it('should have the same amount of seasons in the dropdown and on the page', async () => {
        const url = 'https://dota.playon.gg/seasons';
        await page.goto(url);

        await page.waitForSelector('li.dropdown > ul li');
        const dropDownSeasons = await page.$$('li.dropdown > ul li');

        const seasonsOnPage = await page.$$('.row .col-md-4');

        expect(dropDownSeasons.length).to.equal(seasonsOnPage.length);

    });

    it('it should have the same amount of open seasons in the dropdown and on the page', async () => {
        const url = 'https://dota.playon.gg/seasons';
        await page.goto(url);

        await page.waitForSelector('li.dropdown > ul li');
        const seasons = await page.$$('li.dropdown > ul li');
        let openSeasonCountOnDropdown = 0;
        let openSeasonCountOnPage = 0;

        for (let season of seasons) {
            const seasonTitle = await getPropertyBySelector(season, 'a', 'innerHTML');

            // If we have the small element, that means that it's a season open for registration
            if (seasonTitle.includes('<small>')) {
                openSeasonCountOnDropdown++;
            }
        }

        const seasonsOnPage = await page.$$('.row .col-md-4');
        for (let season of seasonsOnPage) {
            const seasonInformation = await getPropertyByHandle(season, 'innerHTML');

            // If we have an 'i', that means that it's a season open for registration
            if (seasonInformation.includes('<i>')) {
                openSeasonCountOnPage++;
            }
        }

        expect(openSeasonCountOnDropdown).to.equal(openSeasonCountOnPage);

    });

    it('should redirect to steam login when you click "Sign in through STEAM"', async () => {
        const url = 'https://dota.playon.gg/seasons';
        await page.goto(url);

        await page.waitForSelector('.loginBlock img');
        const loginButton = await page.$('.loginBlock a');

        if (loginButton) {
            console.log('found a login button?');
            await loginButton.click();
        }

        await page.waitForSelector('#logo_holder');

        const currentUrl = await page.url();

        expect(currentUrl.split('/openid')[0]).to.equal('https://steamcommunity.com');

    });
});