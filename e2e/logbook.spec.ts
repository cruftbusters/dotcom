import { test, expect } from '@playwright/test'
import { TextSheet } from '../src/v2/Logbook/TextSheet'
import { expectToBeTextSheet } from './fixtures'

test('missing headers error', async ({ page }) => {
  await page.goto('http://localhost:5173/apps/logbook')

  const sheet = new TextSheet([
    ['credit', 'debitt', 'amount'],
    ['liability', 'expense', ' 100 '],
  ])

  const text = sheet.toText()

  await page.getByLabel('transfers').fill(text)

  await expect(page.getByLabel('status')).toHaveText(
    'sheet error: expected headers "credit", "debit", and "amount"',
  )
})

test('single transfer and summary', async ({ page }) => {
  await page.goto('http://localhost:5173/apps/logbook')

  const sheet = new TextSheet([
    ['credit', 'debit', 'amount'],
    ['liability', 'expense', ' 100 '],
  ])

  const text = sheet.toText()

  await page.getByLabel('transfers').fill(text)

  await expect(page.getByLabel('status')).toHaveText('sheet ok')

  await expectToBeTextSheet(
    page.getByLabel('summary'),
    new TextSheet([
      ['account', 'amount'],
      ['expense', ' 100 '],
      ['liability', ' ( 100 ) '],
    ]),
  )
})

test('multiple transfers and summary', async ({ page }) => {
  await page.goto('http://localhost:5173/apps/logbook')

  const sheet = new TextSheet([
    ['credit', 'debit', 'amount'],
    ['liability', 'expense', ' 100 '],
    ['assets', 'liability', ' 100 '],
  ])

  const text = sheet.toText()

  await page.getByLabel('transfers').fill(text)

  await expect(page.getByLabel('status')).toHaveText('sheet ok')

  await expectToBeTextSheet(
    page.getByLabel('summary'),
    new TextSheet([
      ['account', 'amount'],
      ['assets', ' ( 100 ) '],
      ['expense', ' 100 '],
    ]),
  )
})

test('load an example for major accounting categories', async ({ page }) => {
  await page.goto('http://localhost:5173/apps/logbook')

  await page.getByRole('button', { name: 'load example' }).click()

  await expect(page.getByLabel('status')).toHaveText('loaded example')

  await expectToBeTextSheet(
    page.getByLabel('summary'),
    new TextSheet([
      ['account', 'amount'],
      ['assets:checking', ' 51 '],
      ['equity:capital contribution', ' ( 200 ) '],
      ['equity:draw', ' 50 '],
      ['expense:government fees', ' 135 '],
      ['expense:income tax', ' 100 '],
      ['expense:net pay', ' 300 '],
      ['expense:office supplies', ' 200 '],
      ['income:checking interest', ' ( 1 ) '],
      ['income:via client', ' ( 1000 ) '],
      ['liability:credit card', ' ( 135 ) '],
      ['liability:income receivable', ' 500 '],
    ]),
  )
})
