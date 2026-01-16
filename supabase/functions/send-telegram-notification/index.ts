import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'contact_form' | 'calculator_request';
  name: string;
  telegram?: string;
  email?: string;
  description?: string;
  budget?: number;
  duration?: number;
  pace?: string;
  nda?: string;
  deadline?: string;
  revisions?: string;
  attachments?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      console.log('Telegram credentials not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'Telegram not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const payload: NotificationPayload = await req.json();

    let message = '';
    
    if (payload.type === 'contact_form') {
      message = `🔔 <b>Новая заявка с формы</b>\n\n`;
      message += `👤 <b>Имя:</b> ${payload.name}\n`;
      if (payload.telegram) message += `📱 <b>Telegram:</b> ${payload.telegram}\n`;
      if (payload.email) message += `📧 <b>Email:</b> ${payload.email}\n`;
      if (payload.description) message += `\n📝 <b>Описание:</b>\n${payload.description}\n`;
      if (payload.attachments && payload.attachments.length > 0) {
        message += `\n📎 <b>Вложения:</b> ${payload.attachments.length} файл(ов)\n`;
        payload.attachments.forEach((url, i) => {
          message += `  ${i + 1}. ${url}\n`;
        });
      }
    } else if (payload.type === 'calculator_request') {
      message = `🧮 <b>Заявка из калькулятора</b>\n\n`;
      if (payload.budget) message += `💰 <b>Бюджет:</b> ${new Intl.NumberFormat('ru-RU').format(payload.budget)} ₽\n`;
      if (payload.duration) {
        const mins = Math.floor(payload.duration / 60);
        const secs = payload.duration % 60;
        const durStr = mins > 0 ? `${mins} мин ${secs > 0 ? secs + ' сек' : ''}` : `${secs} сек`;
        message += `⏱ <b>Длительность:</b> ${durStr}\n`;
      }
      if (payload.pace) message += `🎬 <b>Темп:</b> ${payload.pace}\n`;
      if (payload.nda) message += `🔒 <b>NDA:</b> ${payload.nda}\n`;
      if (payload.deadline) message += `📅 <b>Срок:</b> ${payload.deadline} дней\n`;
      if (payload.revisions) message += `🔄 <b>Правки:</b> ${payload.revisions} кругов\n`;
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: result.ok }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});