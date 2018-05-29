import { Component, OnInit, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { DomSanitizer } from '@angular/platform-browser';
import { galleryItemAnimation, cardAnimation } from '../animations/animations';
import { ElectronWrapperService } from '../services/electronWrapper.service';
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  animations: [galleryItemAnimation, cardAnimation]
})
export class GalleryComponent implements OnInit {
  galleryItems = [];
  numberOfPages = 0;
  currentPage = 0;
  paginatorLength = [];
  isPreviousDisabled = true;
  isNextDisabled = true;
  numElementsOnEachPage = 12;
  folderLocations = [];
  numExportFiles = 0;
  exportLocation = '';
  showNotification = false;

  visibleGalleryItems: Array<any> = [];

  testState = 'true';
  test() {
    this.testState = this.testState == 'true' ? 'false' : 'true';
  }

  constructor(
    private electronService: ElectronService,
    private ngZone: NgZone,
    private domSanitizer: DomSanitizer,
    private electronWrapperService: ElectronWrapperService
  ) {}

  ngOnInit() {
    this.electronWrapperService
      .getDataOnce('load_from_settings', null, 'settings')
      .then(result => {
        let event = result.event;
        let data = result.data;

        console.log(data);
        if (data) {
          this.ngZone.run(() => {
            this.galleryItems = data.galleryItems || this.galleryItems;
            this.currentPage = data.currentPage || this.currentPage;
            this.numberOfPages = data.numberOfPages || this.numberOfPages;
            this.paginatorLength = data.paginatorLength || this.paginatorLength;
            this.isPreviousDisabled =
              data.isPreviousDisabled || this.isPreviousDisabled;
            this.isNextDisabled = data.isNextDisabled || this.isNextDisabled;
            this.numElementsOnEachPage =
              data.numElementsOnEachPag || this.numElementsOnEachPage;
            this.folderLocations = data.folderLocations || this.folderLocations;
            this.exportLocation = data.exportLocation || this.exportLocation;
            this.sanitizeImagePaths();
          });
        }
      });
  }

  load() {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('load_gallery');
      this.hookGalleryEvent();
    }
  }

  hookGalleryEvent() {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.once('galleryItems', (evnt, data) => {
        console.log('Data recd! ', data);
        this.ngZone.run(() => {
          if (data && data.length) {
            data.forEach(element => {
              this.galleryItems.push({
                name: element.name,
                path: element.path,
                text: null,
                isSelected: false,
                isVisible: false,
                isExported: false
              });
            });
            //sanitize
            this.sanitizeImagePaths();

            //create paginators
            this.createPaginator();

            //assign pageNumbers
            this.setupPageNumbersAndVisible();

            //notify settings updated
            this.notifySettingsUpdated();
          }
        });
      });
    }
  }

  sanitizeImagePaths() {
    this.galleryItems.forEach(item => {
      item.imageSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(
        item.path
      );
    });
  }

  setupPageNumbersAndVisible() {
    this.galleryItems.forEach((item, index) => {
      item.pageNumber = Math.floor(index / this.numElementsOnEachPage) + 1;
      item.isVisible = item.pageNumber == this.currentPage;
    });

    this.refillVisibleGalleryItems();
  }

  refillVisibleGalleryItems() {
    let needToChange = false;
    if (!this.visibleGalleryItems.length) {
      needToChange = true;
    } else {
      for (let i = 0; i < this.visibleGalleryItems.length; i++) {
        if (this.visibleGalleryItems[i].pageNum !== this.currentPage) {
          needToChange = true;
          break;
        }
      }
    }
    if (needToChange) {
      // this.visibleGalleryItems = [];

      let visibleItems = this.galleryItems.filter(x => x.isVisible);

      visibleItems.forEach(x => this.visibleGalleryItems.push(x));
    }
  }

  createPaginator() {
    this.paginatorLength = [];
    this.numberOfPages =
      Math.floor(this.galleryItems.length / this.numElementsOnEachPage) + 1;
    for (let i = 1; i <= this.numberOfPages; i++) {
      this.paginatorLength.push(i);
    }
    // this.paginatorLength = new Array(this.numberOfPages);
    this.currentPage = 1;
    this.setupVisible();
    this.setupDisabled();
  }

  setupVisible() {
    this.galleryItems.forEach(x => {
      x.isVisible = x.pageNumber == this.currentPage;
    });

    this.refillVisibleGalleryItems();
  }
  setupDisabled() {
    this.isNextDisabled = this.currentPage == this.numberOfPages;
    this.isPreviousDisabled = this.currentPage == 1;
  }

  gotoPage(pageNum) {
    this.currentPage = pageNum;
    this.setupVisible();
    this.setupDisabled();
    this.notifySettingsUpdated();
  }
  gotoNext() {
    this.currentPage = this.currentPage + 1;
    this.setupVisible();
    this.setupDisabled();
    this.notifySettingsUpdated();
  }
  gotoPrevious() {
    this.currentPage = this.currentPage - 1;
    this.setupVisible();
    this.setupDisabled();
    this.notifySettingsUpdated();
  }

  handleClick(item) {
    item.isSelected = !item.isSelected;
    this.notifySettingsUpdated();
  }

  export(path) {
    console.log(path);
    this.exportLocation = path;
    if (this.electronService.isElectronApp) {
      if (this.galleryItems.length) {
        this.electronService.ipcRenderer.send('export', {
          items: this.galleryItems.filter(x => x.isSelected),
          path: path
        });

        this.electronService.ipcRenderer.once(
          'export_status',
          (event, data) => {
            this.ngZone.run(() => {
              if (data && data.length) {
                data.forEach(item => {
                  var galleryItem = this.galleryItems.find(
                    x => x.path == item.path
                  );
                  if (galleryItem) {
                    galleryItem.isExported = true;
                  }
                });
                this.showNotification = true;
                this.numExportFiles = data.length;
                this.notifySettingsUpdated();
              }
            });
          }
        );
      }
    }
  }

  notifySettingsUpdated() {
    if (this.electronService.isElectronApp && this.galleryItems.length !== 0) {
      var itemsToSave = this.galleryItems.map(element => {
        return {
          name: element.name,
          path: element.path,
          text: element.text,
          isSelected: element.isSelected,
          isVisible: element.isVisible,
          isExported: element.isExported,
          pageNumber: element.pageNumber
        };
      });
      this.electronService.ipcRenderer.send('gallery-settings-updated', {
        galleryItems: itemsToSave,
        currentPage: this.currentPage,
        numberOfPages: this.numberOfPages,
        paginatorLength: this.paginatorLength,
        isPreviousDisabled: this.isPreviousDisabled,
        isNextDisabled: this.isNextDisabled,
        numElementsOnEachPage: this.numElementsOnEachPage,
        folderLocations: this.folderLocations,
        exportLocation: this.exportLocation
      });
    }
  }

  handleAddClick(event) {
    console.log('Add click!', event);

    if (this.electronService.isElectronApp) {
      this.folderLocations.push(event);
      this.electronService.ipcRenderer.send('add_folder_path', event);
      this.hookGalleryEvent();
    }
  }

  handleRemove(event) {
    console.log('Remove: ', event);
    if (this.electronService.isElectronApp) {
      this.folderLocations = this.folderLocations.filter(x => x !== event);
      this.electronService.ipcRenderer.send('remove_folder_path', event);

      this.galleryItems = this.galleryItems.filter(
        x => !x.path.startsWith(event)
      );

      //create paginators
      this.createPaginator();

      //assign pageNumbers
      this.setupPageNumbersAndVisible();

      this.notifySettingsUpdated();
    }
  }

  dismissNotification() {
    this.showNotification = false;
  }
}
