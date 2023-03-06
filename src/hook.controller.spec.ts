import { TestSupport } from '../test/test-support';
import { HookController } from './hook.controller';
import { TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';

describe('HookController', () => {
  let controller: HookController;
  let httpService: HttpService;

  let postSpy: jest.SpyInstance;

  beforeEach(async () => {
    const app: TestingModule = await TestSupport.buildTestingModule();

    controller = app.get<HookController>(HookController);
    httpService = app.get<HttpService>(HttpService);

    postSpy = jest
      .spyOn(httpService, 'post')
      .mockImplementation((input): any => ({
        toPromise: () =>
          Promise.resolve({
            status: 200,
            statusText: 'SUCCESS',
          }),
      }));
  });

  describe('hook endpoint', () => {
    it('should process manual pr declined', async () => {
      const testContent = TestSupport.loadBitbucketEvent('manual.pr.declined');
      const testWebHook = '';
      const response = await controller.post(testContent, testWebHook);

      expect(postSpy).toHaveBeenCalledWith('', {
        '@type': 'MessageCard',
        'title':
          'CTestProject-250-pagerduty-to-servicenow - pr:declined- Change pagerduty email arn to servicenow email arn',
        'text': 'TestProject/test-repository Pull Request #6 was declined.',
        'potentialAction': [
          {
            '@type': 'OpenUri',
            'name': 'View Pull Request',
            'targets': [
              {
                'os': 'default',
                'uri':
                  'https://company.bitbucket.domain.name/projects/TestProject/repos/test-repository/pull-requests/6',
              },
            ],
          },
        ],
        'sections': [
          {
            'facts': [
              { 'name': 'Created By:', 'value': 'Test User' },
              {
                'name': 'Pull Request URL:',
                'value':
                  'https://company.bitbucket.domain.name/projects/TestProject/repos/test-repository/pull-requests/6',
              },
            ],
          },
        ],
      });
    });
    it('should process manual pr comment added', async () => {
      const testContent = TestSupport.loadBitbucketEvent(
        'manual.pr.comment-added',
      );
      const testWebHook = '';
      const response = await controller.post(testContent, testWebHook);

      expect(postSpy).toHaveBeenCalledWith('', {
        '@type': 'MessageCard',
        'title':
          'CTestProject-250-pagerduty-to-servicenow - pr:comment:added- Change pagerduty email arn to servicenow email arn',
        'text':
          'TestProject/test-repository Pull Request #6 recieved comments.',
        'potentialAction': [
          {
            '@type': 'OpenUri',
            'name': 'View Pull Request',
            'targets': [
              {
                'os': 'default',
                'uri':
                  'https://company.bitbucket.domain.name/projects/TestProject/repos/test-repository/pull-requests/6',
              },
            ],
          },
          {
            '@type': 'OpenUri',
            'name': 'View Comment',
            'targets': [
              {
                'os': 'default',
                'uri':
                  'https://company.bitbucket.domain.name/projects/TestProject/repos/test-repository/pull-requests/6/overview?commentId=34489',
              },
            ],
          },
        ],
        'sections': [
          {
            'facts': [
              { 'name': 'Created By:', 'value': 'Test User' },
              {
                'name': 'Pull Request URL:',
                'value':
                  'https://company.bitbucket.domain.name/projects/TestProject/repos/test-repository/pull-requests/6',
              },
              { 'name': 'Comment text:', 'value': 'oeauaoeua' },
            ],
          },
        ],
      });
    });
    it('should process pr-comment-added', async () => {
      const testContent = TestSupport.loadBitbucketEvent('pr-comment-added');
      const testWebHook = '';
      const response = await controller.post(testContent, testWebHook);

      expect(postSpy).toHaveBeenCalledWith('', {
        '@type': 'MessageCard',
        'title': 'comment-pr - pr:comment:added- A cool PR',
        'text': 'PROJ/repository Pull Request #11 recieved comments.',
        'potentialAction': [
          {
            '@type': 'OpenUri',
            'name': 'View Pull Request',
            'targets': [
              {
                'os': 'default',
                'uri':
                  'https://company.bitbucket.domain.name/projects/PROJ/repos/repository/pull-requests/11/overview',
              },
            ],
          },
          {
            '@type': 'OpenUri',
            'name': 'View Comment',
            'targets': [
              {
                'os': 'default',
                'uri':
                  'https://company.bitbucket.domain.name/projects/PROJ/repos/repository/pull-requests/11/overview/overview?commentId=62',
              },
            ],
          },
        ],
        'sections': [
          {
            'facts': [
              { 'name': 'Created By:', 'value': 'Administrator' },
              {
                'name': 'Pull Request URL:',
                'value':
                  'https://company.bitbucket.domain.name/projects/PROJ/repos/repository/pull-requests/11/overview',
              },
              { 'name': 'Comment text:', 'value': 'I am a PR comment' },
            ],
          },
        ],
      });
    });

    it('should process all test events', async () => {
      const testContents = TestSupport.loadAllBitbucketTestFiles();
      for (const testContent of testContents) {
        const testWebHook = '';
        const response = await controller.post(testContent, testWebHook);
      }
      // 27 - (1 event with the slug) - (1 manual event)
      expect(postSpy).toHaveBeenCalledTimes(testContents.length - 2);
    });
  });
});
