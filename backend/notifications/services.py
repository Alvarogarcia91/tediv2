import logging
from django.utils import timezone
from datetime import timedelta
from .models import SystemEvent, InAppNotification

logger = logging.getLogger(__name__)

def create_child_checked_in_event(child, actor):
    try:
        title = f"Check-In: {child.full_name}"
        message = f"{child.full_name} ha ingresado a las instalaciones."
        
        event = SystemEvent.objects.create(
            event_type='child_checked_in',
            title=title,
            message=message,
            child=child,
            actor=actor
        )
        
        for parent_profile in child.parent_profiles.all():
            InAppNotification.objects.create(
                recipient=parent_profile.user,
                event=event,
                title=title,
                message=message,
                notification_type='info'
            )
        return event
    except Exception as e:
        logger.error(f"Error creating child checked-in event: {e}", exc_info=True)
        return None


def create_child_checked_out_event(child, actor, billable_minutes, remaining_minutes):
    try:
        title = f"Check-Out: {child.full_name}"
        message = f"{child.full_name} ha salido. Tiempo facturado: {billable_minutes} min. Saldo restante: {remaining_minutes} min."
        
        event = SystemEvent.objects.create(
            event_type='child_checked_out',
            title=title,
            message=message,
            child=child,
            actor=actor,
            metadata={
                'billable_minutes': billable_minutes,
                'remaining_minutes': remaining_minutes
            }
        )
        
        for parent_profile in child.parent_profiles.all():
            InAppNotification.objects.create(
                recipient=parent_profile.user,
                event=event,
                title=title,
                message=message,
                notification_type='success'
            )
        return event
    except Exception as e:
        logger.error(f"Error creating child checked-out event: {e}", exc_info=True)
        return None


def create_low_balance_event(child, remaining_minutes):
    try:
        # Avoid recent duplicates within 5 minutes
        five_minutes_ago = timezone.now() - timedelta(minutes=5)
        recent_exists = SystemEvent.objects.filter(
            event_type='low_balance',
            child=child,
            created_at__gte=five_minutes_ago
        ).exists()
        
        if recent_exists:
            logger.info(f"Skipping duplicate low balance event for child {child.id} ({child.full_name}) as one was created in the last 5 minutes.")
            return None
            
        title = f"Saldo Bajo: {child.full_name}"
        message = f"El saldo de horas disponible para {child.full_name} es bajo ({remaining_minutes} min restantes)."
        
        event = SystemEvent.objects.create(
            event_type='low_balance',
            title=title,
            message=message,
            child=child,
            metadata={
                'remaining_minutes': remaining_minutes
            }
        )
        
        for parent_profile in child.parent_profiles.all():
            InAppNotification.objects.create(
                recipient=parent_profile.user,
                event=event,
                title=title,
                message=message,
                notification_type='warning'
            )
        return event
    except Exception as e:
        logger.error(f"Error creating low balance event: {e}", exc_info=True)
        return None


def create_package_paid_event(purchase):
    try:
        child = purchase.child
        package_name = purchase.package.name if purchase.package else "Paquete Especial"
        title = f"Paquete Acreditado: {child.full_name}"
        message = f"Se ha acreditado el pago del paquete {package_name} ({purchase.purchased_minutes} min) para {child.full_name}."
        
        event = SystemEvent.objects.create(
            event_type='package_paid',
            title=title,
            message=message,
            child=child,
            actor=purchase.created_by,
            metadata={
                'purchase_id': purchase.id,
                'package_name': package_name,
                'purchased_minutes': purchase.purchased_minutes,
                'amount': str(purchase.amount)
            }
        )
        
        for parent_profile in child.parent_profiles.all():
            InAppNotification.objects.create(
                recipient=parent_profile.user,
                event=event,
                title=title,
                message=message,
                notification_type='success'
            )
        return event
    except Exception as e:
        logger.error(f"Error creating package paid event: {e}", exc_info=True)
        return None
