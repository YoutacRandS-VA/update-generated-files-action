import * as git from '../src/git'
import { handleOtherEvent } from '../src/other_event'

const octokitMock = {
  rest: {
    pulls: {
      create: jest.fn(),
      requestReviewers: jest.fn(),
    },
    issues: {
      addAssignees: jest.fn(),
    },
  },
}

jest.mock('@actions/core')
jest.mock('@actions/github', () => ({ getOctokit: () => octokitMock }))
jest.mock('../src/git')

test('other event', async () => {
  octokitMock.rest.pulls.create.mockResolvedValueOnce({
    data: {
      number: 987,
      html_url: 'https://github.com/int128/update-generated-files-action/pulls/987',
      base: {
        repo: {
          full_name: 'int128/update-generated-files-action',
        },
      },
    },
  })

  await handleOtherEvent(
    {
      title: 'Follow up the generated files',
      body: 'Body',
      dispatchWorkflows: [],
      token: 'GITHUB_TOKEN',
    },
    {
      ref: 'refs/heads/main',
      workflow: 'workflow',
      job: 'job',
      runId: 123,
      runNumber: 321,
      serverUrl: 'https://github.com',
      actor: 'octocat',
      eventName: 'dummy',
      sha: '0123456789abcdef',
      repo: {
        owner: 'int128',
        repo: 'update-generated-files-action',
      },
    }
  )

  expect(git.createBranch).toHaveBeenCalledWith({
    branch: 'update-generated-files-0123456789abcdef-321',
    token: 'GITHUB_TOKEN',
    commitMessage:
      'Generated by GitHub Actions (workflow / job)\n\n' +
      'Follow up the generated files\n' +
      'https://github.com/int128/update-generated-files-action/actions/runs/123',
  })

  expect(octokitMock.rest.pulls.create).toHaveBeenCalled()
  expect(octokitMock.rest.pulls.requestReviewers).toHaveBeenCalled()
  expect(octokitMock.rest.issues.addAssignees).toHaveBeenCalled()
})
