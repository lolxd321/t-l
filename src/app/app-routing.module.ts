import { NgModule } from '@angular/core';
import {Routes, RouterModule } from '@angular/router';
import {WelcomeComponent} from './auth/welcome.component';
import {TrainingComponent} from './training/training.component';
import {GirlsComponent} from './browse/girls/girls.component';
import {TripsComponent} from './trips/trips.component';
import {FavoritesComponent} from './favorites/favorites.component';
import {ProfileComponent} from './profile/profile.component';
import {ChatsComponent} from './chats/chats.component';
import {SentComponent} from './chats/sent/sent.component';
import {TrashComponent} from './chats/trash/trash.component';
import {EditProfileComponent} from './profile/edit-profile/edit-profile.component';
import {ProfileVisitorsComponent} from './profile/profile-visitors/profile-visitors.component';
import {SettingsComponent} from './profile/settings/settings.component';
import {OthersProfileComponent} from './others/others-profile/others-profile.component';
import {TraveTipsComponent} from './pages/trave-tips/trave-tips.component';
import {TermsComponent} from './pages/terms/terms.component';
import {PrivacyComponent} from './pages/privacy/privacy.component';
import {SitemapComponent} from './pages/sitemap/sitemap.component';
import {ContactusComponent} from './pages/contactus/contactus.component';
import {AboutusComponent} from './pages/aboutus/aboutus.component';
import {NeedHelpComponent} from './pages/need-help/need-help.component';
import {PremiumComponent} from './premium/premium.component';
import {AddTripComponent} from './trips/add-trip/add-trip.component';
import {StartConversationComponent} from './others/others-profile/start-conversation/start-conversation.component';
import { ScoutComponent } from './scout/scout.component';
import {MembershipComponent} from './profile//membership/membership.component';
import {FakesComponent} from './dashboard/fakes/fakes.component';
import {ScoutsComponent} from './dashboard/scouts/scouts.component';
import {DatasComponent} from './dashboard/datas/datas.component';

import {RemindComponent} from './profile/settings/change-password/remind/remind.component';
import {ChangePasswordComponent} from './profile/settings/change-password/change-password.component';
import {EmailComponent} from './profile/settings/email/email.component';

import { AuthGuard } from './auth/auth.guard';
import {UserManagementComponent} from './auth/user-management/user-management.component';

const routes: Routes = [
  {path: 'welcome', component: WelcomeComponent},  //default route
  {path: 'training', component: TrainingComponent},
  {path: 'browse/girls', component: GirlsComponent},
  {path: 'browse/man', component: GirlsComponent},
  {path: 'userMgmt', component: UserManagementComponent},


  {path: 'trips', component: TripsComponent},
  {path: 'trips/add-trip', component: AddTripComponent},
  {path: 'favorites', component: FavoritesComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent},

  {path: 'conversations/sent', component: SentComponent},

  {path: 'remind', component: RemindComponent},
  {path: 'change-password', component: ChangePasswordComponent},
  {path: 'profile/settings/email', component: EmailComponent},

  {path: 'profile/membership', component: MembershipComponent},

  {path: 'conversations/sent/:id', component: SentComponent},
  {path: 'conversations/sent', component: SentComponent},

  {path: 'conversations/inbox/:id', component: ChatsComponent},
  {path: 'conversations/inbox', component: ChatsComponent},

  {path: 'conversations/trash/:id', component: TrashComponent},
  {path: 'conversations/trash', component: TrashComponent},

  {path: 'admin/dashboard/fakes', component: FakesComponent},
  {path: 'admin/dashboard/scout', component: ScoutsComponent},
  {path: 'admin/dashboard/datas', component: DatasComponent},


  {path: 'profile/edit-profile', component: EditProfileComponent},
  {path: 'profile/profile-visitors', component: ProfileVisitorsComponent},
  {path: 'profile/settings', component: SettingsComponent},
  {path: 'profile/:id/:name', component: OthersProfileComponent},
  {path: 'become-scout', component: ScoutComponent},
  {path: 'tips', component: TraveTipsComponent},
  {path: 'faq', component: NeedHelpComponent},
  {path: 'terms-and-conditions', component: TermsComponent},
  {path: 'privacy-policy', component: PrivacyComponent},
  {path: 'sitemap', component: SitemapComponent},
  {path: 'support', component: ContactusComponent},
  {path: 'about-us', component: AboutusComponent},
  {path: 'premium', component: PremiumComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
