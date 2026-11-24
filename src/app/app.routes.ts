import { Routes } from '@angular/router';
import { FeedComponent } from './pages/feed/feed.component';
import { HelpComponent } from './pages/help/help.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: FeedComponent },
  { path: 'help', component: HelpComponent },
  { path: '**', component: NotFoundComponent },
];
