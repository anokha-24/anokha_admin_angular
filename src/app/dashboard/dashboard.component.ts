import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from "../loading/loading.component";
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    LoadingComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  public loading: boolean;
  public sortedColumn: string;
  public sortOrder: number;
  public filteredEvents: any[];
  public eventStats: any[];
  public apiService: ApiService;
  public router: Router;
  public totalEarnings: number;

  constructor() {
    this.loading = false;
    this.sortedColumn = 'totalRevenue';
    this.sortOrder = -1; // 1 for ascending, -1 for descending
    this.filteredEvents = [];
    this.eventStats = [];
    this.apiService = inject(ApiService);
    this.router = inject(Router);
    this.totalEarnings = 0;
  }

  async ngOnInit() {
    this.loading = true;

    this.apiService.getEventRegistrationStats().then((resMap) => {
      const data = resMap.get('data');
      const errorMessage = resMap.get('errorMessage');

      if (data) {
        this.eventStats = data.events;
        this.totalEarnings = this.eventStats.reduce((acc, event) => {
          return acc + parseInt(event.totalRevenue ?? 0);
        }, 0);

        this.filterEvents();
        this.loading = false;
      } else if (typeof errorMessage === 'string' && errorMessage.length > 0) {
        this.router.navigate(['/login']);
      } else {
        this.loading = false;
      }

    })
  }

  filterEvents() {
    this.filteredEvents = this.eventStats;
    if (this.sortedColumn) {
      this.filteredEvents = this.sortByColumn(this.filteredEvents, this.sortedColumn, this.sortOrder);
    }
  }

  sortByColumn(data: any[], property: string, order: number) {
    return data.sort((a, b) => {
      const aValue = typeof a[property] === 'string' ? a[property].toLowerCase() : a[property];
      const bValue = typeof b[property] === 'string' ? b[property].toLowerCase() : b[property];
      return (aValue - bValue)
        * order;
    });
  }

  sortBy(column: string) {
    if (this.sortedColumn === column) {
      this.sortOrder *= -1;
    } else {
      this.sortedColumn = column;
      this.sortOrder = 1;
    }
    this.filterEvents();
  }
}
