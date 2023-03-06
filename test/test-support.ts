import * as fs from 'fs';

import { HttpModule, HttpService } from '@nestjs/common';

import { TeamsIncomingHookService } from '../src/teams-incoming-hook.service';
import { HookController } from '../src/hook.controller';
import { Test } from '@nestjs/testing';

export class TestSupport {
  public static async buildTestingModule() {
    return await Test.createTestingModule({
      imports: [
        // ConfigModule.forRoot({ isGlobal: true }),
        HttpModule,
      ],
      controllers: [HookController],
      providers: [
        TeamsIncomingHookService,
        // {
        //   provide: HttpService,
        //   useValue: {
        //     get: () => {
        //       toPromise: () => Promise.resolve()
        //     },
        //   },
        // },
      ],
    }).compile();
  }

  static loadBitbucketEvent(
    type:
      | 'mirror-repo-sync'
      | 'pr-comment-added'
      | 'pr-comment-deleted'
      | 'pr-comment-edited'
      | 'pr-declined'
      | 'pr-deleted'
      | 'pr-from-ref-updated'
      | 'pr-merged'
      | 'pr-modified'
      | 'pr-opened'
      | 'pr-reviewer-approved'
      | 'pr-reviewer-needs-work'
      | 'pr-reviewer-unapproved'
      | 'pr-reviewer-updated'
      | 'repo-commented-added'
      | 'repo-comment-deleted'
      | 'repo-comment-edit'
      | 'repo-events-push'
      | 'repo-fork'
      | 'repo-modified'
      | 'manual.pr.declined'
      | 'manual.pr.comment-added'
      | 'manual.pr.refs.updated'
      | 'manual.repo.refs.changed',
  ) {
    const data = JSON.parse(
      fs.readFileSync(`./test/test-files/${type}.json`).toString(),
    );
    return data;
  }

  static loadAllBitbucketTestFiles() {
    let allEvents = [];
    const fileNames = fs.readdirSync('./test/test-files/');
    for (const file of fileNames) {
      try {
        const data = JSON.parse(
          fs.readFileSync(`./test/test-files/${file}`).toString(),
        );
        allEvents.push(data);
      } catch (ex) {
        console.error(`Error loading data from ${file}: ${ex}`);
      }
    }
    return allEvents;
  }
}
