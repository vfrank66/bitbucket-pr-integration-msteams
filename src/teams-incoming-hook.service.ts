import { HttpService, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TeamsIncomingHookService {
  private readonly logger = new Logger(TeamsIncomingHookService.name);

  constructor(private readonly httpService: HttpService) {}

  async sendWebhook(content: any, url: string) {
    // this.logger.log(content);
    // PR is deleted no reason to do anything with
    if (content.eventKey === 'pr:deleted') {
      return;
    }
    try {
      let message = null;
      if (content.eventKey.startsWith('repo')) {
        message = this.buildRepoChangeMSTeamsMessage(content);
      }
      if (content.eventKey.startsWith('pr')) {
        message = this.buildPullRequestChangeMSTeamsMessage(content);
      }
      this.logger.debug(
        `Posting message to ${url}: ${JSON.stringify(message)}`,
      );
      const response = await this.httpService.post(url, message).toPromise();
      this.logger.log(
        `Successfully posted message to ${url}: ${response.status} (${response.statusText})`,
      );
    } catch (e) {
      this.logger.error(`Error posting message to ${url}: ${e}`);
    }
  }

  buildRepoChangeMSTeamsMessage(content: any) {
    return {
      '@type': 'MessageCard',
      'title': `${content.eventKey} ${content?.repository?.slug}`,
      'text': `Not coded to process this change`,
      'potentialAction': [],
      'sections': [],
    };
  }

  buildPullRequestChangeMSTeamsMessage(content: any) {
    const event = content?.eventKey;
    const repoProjectKey =
      content.pullRequest?.fromRef?.repository?.project?.key;
    const projectName = content.pullRequest?.fromRef?.repository?.project?.name;
    const repoName = content.pullRequest?.fromRef?.repository?.name;
    const pullRequestId = content.pullRequest?.id;
    const repositoryFullname =
      content?.pullRequest?.fullName ?? repoProjectKey + '/' + repoName;
    const pullRequestLink =
      content?.pullRequest?.links?.self[0]?.href ??
      'https://company.bitbucket.domain.name/projects/' +
        repoProjectKey +
        '/repos/' +
        repoName +
        '/pull-requests/' +
        pullRequestId +
        '/overview';

    const message = {
      '@type': 'MessageCard',
      'title': `${content?.pullRequest?.fromRef?.displayId} - ${event
        .toLowerCase()
        .replace('PR:', '')}- ${content?.pullRequest?.title}`,
      'text': `${repositoryFullname} Pull Request #${pullRequestId} ${this.eventTextSuffix(
        event,
      )}`,
      'potentialAction': [
        {
          '@type': 'OpenUri',
          'name': 'View Pull Request',
          'targets': [{ os: 'default', uri: pullRequestLink }],
        },
      ],
      'sections': [
        {
          facts: [
            { name: 'Created By:', value: content?.actor?.displayName },
            { name: 'Pull Request URL:', value: pullRequestLink },
          ],
        },
      ],
    };

    if (event.includes('comment')) {
      message['sections'][0].facts.push({
        name: 'Comment text:',
        value: content.comment?.text,
      });
      message['potentialAction'].push({
        '@type': 'OpenUri',
        'name': 'View Comment',
        'targets': [
          {
            os: 'default',
            uri: `${pullRequestLink}/overview?commentId=${content.comment?.id}`,
          },
        ],
      });
    }
    return message;
  }

  eventTextSuffix(event: string) {
    switch (event?.toLowerCase()) {
      case 'pr:opened':
        return 'was opened.';
      case 'pr:modified':
      case 'pr:from_ref_updated':
      case 'update':
        return 'was updated.';
      case 'pr:merged':
        return 'was merged.';
      case 'pr:deleted':
        return 'was deleted.';
      case 'pr:declined':
        return 'was declined.';
      case 'reopen':
        return 'was re-opened.';
      case 'pr:comment:added':
      case 'pr:comment:deleted':
      case 'pr:comment:edit':
        return 'recieved comments.';
      case 'pr:reviewer:updated':
        return 'reviewed upated PR';
      case 'pr:reviewer:needs_work':
        return 'reviewed marked needs work on PR';
      case 'pr:reviewer:unapproved':
        return 'reviewed marked unapproved on PR';
      case 'pr:reviewer:updated':
        return 'reviewed updated PR';
      default:
        return 'event occured.';
    }
  }
}
