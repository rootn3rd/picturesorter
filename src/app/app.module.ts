import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { GalleryComponent } from './gallery/gallery.component';
import { FolderPathComponent } from './folder-path/folder-path.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    FooterComponent,
    GalleryComponent,
    FolderPathComponent
  ],
  imports: [BrowserModule, AppRoutingModule, NgxElectronModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
