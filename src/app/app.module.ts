import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material.module';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { TrainingComponent } from './training/training.component';
import { CurrentTrainingComponent } from './training/current-training/current-training.component';
import { NewTrainingComponent } from './training/new-training/new-training.component';
import { PastTrainingsComponent } from './training/past-trainings/past-trainings.component';
import { WelcomeComponent } from './auth/welcome.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavComponent } from './navigation/sidenav/sidenav.component';
import { GirlsComponent } from './browse/girls/girls.component';
import { PagesComponent } from './pages/pages.component';
import { TripsComponent } from './trips/trips.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { ProfileComponent } from './profile/profile.component';
import {OpenDialogComponent} from './favorites/open-dialog';
import {StopTrainingComponent} from './training/current-training/stop-training.component';
import  {AgmCoreModule} from '@agm/core';
import { ChatsComponent } from './chats/chats.component';
import { ProfileVisitorsComponent } from './profile/profile-visitors/profile-visitors.component';
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { SettingsComponent } from './profile/settings/settings.component';
import { OthersProfileComponent } from './others/others-profile/others-profile.component';
import { TraveTipsComponent } from './pages/trave-tips/trave-tips.component';
import { NeedHelpComponent } from './pages/need-help/need-help.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { SitemapComponent } from './pages/sitemap/sitemap.component';
import { ContactusComponent } from './pages/contactus/contactus.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { PremiumComponent } from './premium/premium.component';
import {RegisterComponent} from './auth/register/register.component';
import {LogComponent} from './auth/login/log.component';
import {AuthService} from './auth/auth.service';
import { TrainingService } from './training/training.service';
import { UIService } from './shared/ui.service';

import {CoreModule} from './core/core.module';
import { DropdownComponent } from './dropdown/dropdown.component';
import { CountriesService } from './dropdown/countries.service';
import { HttpClientModule } from '@angular/common/http';

import {EditLocation} from './profile/edit-profile/editLocation/edit-location';
import {EditLanguage} from './profile/edit-profile/editLanguages/edit-language';
import {EditHeight} from './profile/edit-profile/editHeight/edit-height';
import {EditBodytype} from './profile/edit-profile/editBodyType/edit-bodytype';
import {EditEyes} from './profile/edit-profile/editEyes/edit-eyes';
import {EditHair} from './profile/edit-profile/editHair/edit-hair';
import {EditLooking} from './profile/edit-profile/editLooking/edit-looking';
import {EditAbout} from './profile/edit-profile/editAboutme/edit-aboutme';
import { AddTripComponent } from './trips/add-trip/add-trip.component';


import { AngularFireStorageModule } from '@angular/fire/storage';
import { ImageCropperModule } from 'ngx-image-cropper';
import { EditImageComponent } from './profile/edit-profile/edit-image/edit-image.component';

import {AddPictures} from './profile/edit-profile/addPictures/add-pictures';
import { StartConversationComponent } from './others/others-profile/start-conversation/start-conversation.component';
import { DbQueriesComponent } from './db-queries/db-queries.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { SentComponent } from './chats/sent/sent.component';
import { TrashComponent } from './chats/trash/trash.component';
import { ScoutComponent } from './scout/scout.component';
import { MembershipComponent } from './profile/membership/membership.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FakesComponent } from './dashboard/fakes/fakes.component';
import { ScoutsComponent } from './dashboard/scouts/scouts.component';
import { DatasComponent } from './dashboard/datas/datas.component';
import { BewerbungComponent } from './auth/bewerbung/bewerbung.component';
import { EmailComponent } from './profile/settings/email/email.component';
import { ChangePasswordComponent } from './profile/settings/change-password/change-password.component';
import { DeleteAccountComponent } from './profile/settings/delete-account/delete-account.component';
import { HideAccountComponent } from './profile/settings/hide-account/hide-account.component';
import { RemindComponent } from './profile/settings/change-password/remind/remind.component';
import { ReportUserComponent } from './others/others-profile/report-user/report-user.component';
import { RequestPhotoComponent } from './others/others-profile/request-photo/request-photo.component';
import { FacebookAuthComponent } from './auth/facebook-auth/facebook-auth.component';

import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { RecaptchaModule } from 'ng-recaptcha';
import { UserManagementComponent } from './auth/user-management/user-management.component';


@NgModule({
  declarations: [
    AppComponent,
    TrainingComponent,
    CurrentTrainingComponent,
    NewTrainingComponent,
    PastTrainingsComponent,
    WelcomeComponent,
    HeaderComponent,
    SidenavComponent,
    GirlsComponent,
    PagesComponent,
    TripsComponent,
    FavoritesComponent,
    ProfileComponent,
    OpenDialogComponent,
    ChatsComponent,
    ProfileVisitorsComponent,
    EditProfileComponent,
    SettingsComponent,
    OthersProfileComponent,
    TraveTipsComponent,
    NeedHelpComponent,
    TermsComponent,
    PrivacyComponent,
    SitemapComponent,
    ContactusComponent,
    AboutusComponent,
    PremiumComponent,
    StopTrainingComponent,
    RegisterComponent,
    LogComponent,
    DropdownComponent,
    EditLocation,
    EditLanguage,
    EditHeight,
    EditBodytype,
    EditEyes,
    EditHair,
    EditLooking,
    EditAbout,
    AddTripComponent,
    EditImageComponent,
    AddPictures,
    StartConversationComponent,
    DbQueriesComponent,
    SentComponent,
    TrashComponent,
    ScoutComponent,
    MembershipComponent,
    DashboardComponent,
    FakesComponent,
    ScoutsComponent,
    DatasComponent,
    BewerbungComponent,
    EmailComponent,
    ChangePasswordComponent,
    DeleteAccountComponent,
    HideAccountComponent,
    RemindComponent,
    ReportUserComponent,
    RequestPhotoComponent,
    FacebookAuthComponent,
    UserManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey:'AIzaSyBiMaoCzEXO33UYlRTI_xAbuDqEK186vtY'
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    CoreModule,
    HttpClientModule,
    ImageCropperModule,
    AngularFireStorageModule,
    ScrollToModule.forRoot(),
    RecaptchaModule



  ],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: '6Ld3lt4UAAAAADYG6dJi5OI7vmt-5Wwe2u2w8_60' } as RecaptchaSettings,
    },
     AuthService, DbQueriesComponent, UIService, CountriesService,OthersProfileComponent, EditLocation, AppComponent, ChatsComponent, TrashComponent],
  bootstrap: [AppComponent],
  entryComponents: [OpenDialogComponent,
    StopTrainingComponent,
    RegisterComponent,
    LogComponent,
    EditLocation,
    EditLanguage,
    EditHeight,
    EditBodytype,
    EditEyes,
    EditHair,
    EditLooking,
    EditAbout,
    EditImageComponent,
    AddPictures,
    StartConversationComponent,
    BewerbungComponent,
    DeleteAccountComponent,
    HideAccountComponent,
    ReportUserComponent,
    RequestPhotoComponent,
    FacebookAuthComponent

  ]
})
export class AppModule { }
