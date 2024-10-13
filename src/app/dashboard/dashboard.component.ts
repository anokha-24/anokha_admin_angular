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
  public totalMembers: number;
  public totalRegistrations: number;

  public totalEventEarnings: number;
  public totalEventMembers: number;
  public totalEventRegistrations: number;

  public totalWorkshopEarnings: number;
  public totalWorkshopMembers: number;
  public totalWorkshopRegistrations: number;

  public showZeroRegEvents: boolean = false;
  public showEventsOnly: boolean = false;
  public showWorkshopsOnly: boolean = false;

  constructor() {
    this.loading = false;
    this.sortedColumn = 'totalRevenue';
    this.sortOrder = -1; // 1 for ascending, -1 for descending
    this.filteredEvents = [];
    this.eventStats = [];
    this.apiService = inject(ApiService);
    this.router = inject(Router);

    this.totalEarnings = 0;
    this.totalMembers = 0;
    this.totalRegistrations = 0;

    this.totalEventEarnings = 0;
    this.totalEventMembers = 0;
    this.totalEventRegistrations = 0;
    
    this.totalWorkshopEarnings = 0;
    this.totalWorkshopMembers = 0;
    this.totalWorkshopRegistrations = 0;
  }

  async ngOnInit() {
    this.loading = true;

    this.apiService.getEventRegistrationStats().then((resMap) => {
      const data = resMap.get('data');
      const errorMessage = resMap.get('errorMessage');

      if (data) {
        this.eventStats = data.events;

        this.eventStats.forEach((event) => {
          event.freeSeats = parseInt(event.maxSeats) - parseInt(event.seatsFilled);
        });

        this.totalEarnings = this.eventStats.reduce((acc, event) => {
          return acc + parseInt(event.totalRevenue ?? 0);
        }, 0);
        this.totalMembers = this.eventStats.reduce((acc, event) => {
          return acc + parseInt(event.seatsFilled);
        }, 0);
        this.totalRegistrations = this.eventStats.reduce((acc, event) => {
          return acc + parseInt(event.totalRegistrations ?? 0);
        }, 0);
    
        this.totalEventEarnings = this.eventStats.reduce((acc, event) => {
          return event.isWorkshop === '1' ? acc : acc + parseInt(event.totalRevenue ?? 0);
        }, 0);
        this.totalEventMembers = this.eventStats.reduce((acc, event) => {
          return event.isWorkshop === '1' ? acc : acc + parseInt(event.seatsFilled);
        }, 0);
        this.totalEventRegistrations = this.eventStats.reduce((acc, event) => {
          return event.isWorkshop === '1' ? acc : acc + parseInt(event.totalRegistrations ?? 0);
        }, 0);

        this.totalWorkshopEarnings = this.eventStats.reduce((acc, event) => {
          return event.isWorkshop === '0' ? acc : acc + parseInt(event.totalRevenue ?? 0);
        }, 0);
        this.totalWorkshopMembers = this.eventStats.reduce((acc, event) => {
          return event.isWorkshop === '0' ? acc : acc + parseInt(event.seatsFilled);
        }, 0);
        this.totalWorkshopRegistrations = this.eventStats.reduce((acc, event) => {
          return event.isWorkshop === '0' ? acc : acc + parseInt(event.totalRegistrations ?? 0);
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
    if (this.showZeroRegEvents) {
      this.filteredEvents = this.filteredEvents.filter((event) => {
        return event.seatsFilled === 0;
      });
    }

    if (this.showEventsOnly) {
      this.filteredEvents = this.filteredEvents.filter((event) => {
        return event.isWorkshop === '0';
      });
    } else if (this.showWorkshopsOnly) {
      this.filteredEvents = this.filteredEvents.filter((event) => {
        return event.isWorkshop === '1';
      });
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

  toggleZeroRegEvents() {
    this.showZeroRegEvents = !this.showZeroRegEvents;
    this.filterEvents();
  }

  toggleEventsOnly() {
    if (this.showWorkshopsOnly) {
      this.showWorkshopsOnly = false;
    }
    this.showEventsOnly = !this.showEventsOnly;
    this.filterEvents();
  }

  toggleWorkshopsOnly() {
    if (this.showEventsOnly) {
      this.showEventsOnly = false;
    }
    this.showWorkshopsOnly = !this.showWorkshopsOnly;
    this.filterEvents();
  }
}
