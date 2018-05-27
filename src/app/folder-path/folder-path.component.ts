import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-folder-path',
  templateUrl: './folder-path.component.html',
  styleUrls: ['./folder-path.component.css']
})
export class FolderPathComponent implements OnInit {
  @Output() addClick = new EventEmitter();
  @Output() remove = new EventEmitter();
  @Output() export = new EventEmitter();
  @Input() folderLocations: string[];
  @Input() destPath: string;

  isExportDisabled: boolean = false;

  constructor() {}

  ngOnInit() {}
  onValueChange(value) {
    this.isExportDisabled = value !== '';
  }
}
