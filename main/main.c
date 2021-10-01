#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <regex.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"

#include "ssd1306.h"
#include "font8x8_basic.h"
#include "http.h"
#include "fox_wifi.h"

/*
 You have to set this config value with menuconfig
 CONFIG_INTERFACE

 for i2c
 CONFIG_MODEL
 CONFIG_SDA_GPIO
 CONFIG_SCL_GPIO
 CONFIG_RESET_GPIO

 for SPI
 CONFIG_CS_GPIO
 CONFIG_DC_GPIO
 CONFIG_RESET_GPIO
*/

#define tag "AIDA64_SSD1306"
#define TAG tag

#define REG_COMPILE_OK 0
#define REG_COMPILE_FAIL 1

// config
/* #define REG_EXTENDED 0
#define REG_ICASE 0
#define REG_NOSUB 0 */

void get_info_from_aida64();
char *pick_regex(const char *string, const char *pattern);
void read_buffer_task();

SSD1306_t dev;

static char response[16000] = {0};

void app_main(void)
{

	wifi_init();

	int center, top, bottom;
	char lineChar[20];

#if CONFIG_I2C_INTERFACE
	ESP_LOGI(tag, "INTERFACE is i2c");
	ESP_LOGI(tag, "CONFIG_SDA_GPIO=%d", CONFIG_SDA_GPIO);
	ESP_LOGI(tag, "CONFIG_SCL_GPIO=%d", CONFIG_SCL_GPIO);
	ESP_LOGI(tag, "CONFIG_RESET_GPIO=%d", CONFIG_RESET_GPIO);
	i2c_master_init(&dev, CONFIG_SDA_GPIO, CONFIG_SCL_GPIO, CONFIG_RESET_GPIO);
#endif // CONFIG_I2C_INTERFACE

#if CONFIG_SPI_INTERFACE
	ESP_LOGI(tag, "INTERFACE is SPI");
	ESP_LOGI(tag, "CONFIG_MOSI_GPIO=%d", CONFIG_MOSI_GPIO);
	ESP_LOGI(tag, "CONFIG_SCLK_GPIO=%d", CONFIG_SCLK_GPIO);
	ESP_LOGI(tag, "CONFIG_CS_GPIO=%d", CONFIG_CS_GPIO);
	ESP_LOGI(tag, "CONFIG_DC_GPIO=%d", CONFIG_DC_GPIO);
	ESP_LOGI(tag, "CONFIG_RESET_GPIO=%d", CONFIG_RESET_GPIO);
	spi_master_init(&dev, CONFIG_MOSI_GPIO, CONFIG_SCLK_GPIO, CONFIG_CS_GPIO, CONFIG_DC_GPIO, CONFIG_RESET_GPIO);
#endif // CONFIG_SPI_INTERFACE

#if CONFIG_FLIP
	dev._flip = true;
	ESP_LOGW(tag, "Flip upside down");
#endif

#if CONFIG_SSD1306_128x64
	ESP_LOGI(tag, "Panel is 128x64");
	ssd1306_init(&dev, 128, 64);
#endif // CONFIG_SSD1306_128x64
#if CONFIG_SSD1306_128x32
	ESP_LOGI(tag, "Panel is 128x32");
	ssd1306_init(&dev, 128, 32);
#endif // CONFIG_SSD1306_128x32

	ssd1306_clear_screen(&dev, false);
	ssd1306_contrast(&dev, 0x7f);

#if CONFIG_SSD1306_128x64
	top = 2;
	center = 3;
	bottom = 8;
	ssd1306_display_text(&dev, 0, "SSD1306 128x64", 14, false);
	ssd1306_display_text(&dev, 1, "ABCDEFGHIJKLMNOP", 16, false);
	ssd1306_display_text(&dev, 2, "abcdefghijklmnop", 16, false);
	ssd1306_display_text(&dev, 3, "Hello World!!", 13, false);
	ssd1306_clear_line(&dev, 4, true);
	ssd1306_clear_line(&dev, 5, true);
	ssd1306_clear_line(&dev, 6, true);
	ssd1306_clear_line(&dev, 7, true);
	ssd1306_display_text(&dev, 4, "SSD1306 128x64", 14, true);
	ssd1306_display_text(&dev, 5, "ABCDEFGHIJKLMNOP", 16, true);
	ssd1306_display_text(&dev, 6, "abcdefghijklmnop", 16, true);
	ssd1306_display_text(&dev, 7, "Hello World!!", 13, true);
#endif // CONFIG_SSD1306_128x64

#if CONFIG_SSD1306_128x32
	top = 1;
	center = 1;
	bottom = 4;
	ssd1306_display_text(&dev, 0, "SSD1306 128x32", 14, false);
	ssd1306_display_text(&dev, 1, "Hello World!!", 13, false);
	ssd1306_clear_line(&dev, 2, true);
	ssd1306_clear_line(&dev, 3, true);
	ssd1306_display_text(&dev, 2, "SSD1306 128x32", 14, true);
	ssd1306_display_text(&dev, 3, "Hello World!!", 13, true);
#endif // CONFIG_SSD1306_128x32
	/* vTaskDelay(3000 / portTICK_PERIOD_MS);

	// Display Count Down
	uint8_t image[24];
	memset(image, 0, sizeof(image));
	ssd1306_display_image(&dev, top, (6 * 8 - 1), image, sizeof(image));
	ssd1306_display_image(&dev, top + 1, (6 * 8 - 1), image, sizeof(image));
	ssd1306_display_image(&dev, top + 2, (6 * 8 - 1), image, sizeof(image));
	for (int font = 0x39; font > 0x30; font--)
	{
		memset(image, 0, sizeof(image));
		ssd1306_display_image(&dev, top + 1, (7 * 8 - 1), image, 8);
		memcpy(image, font8x8_basic_tr[font], 8);
		if (dev._flip)
			ssd1306_flip(image, 8);
		ssd1306_display_image(&dev, top + 1, (7 * 8 - 1), image, 8);
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}

	// Scroll Up
	ssd1306_clear_screen(&dev, false);
	ssd1306_contrast(&dev, 0xff);
	ssd1306_display_text(&dev, 0, "---Scroll  UP---", 16, true);
	//ssd1306_software_scroll(&dev, 7, 1);
	ssd1306_software_scroll(&dev, (dev._pages - 1), 1);
	for (int line = 0; line < bottom + 10; line++)
	{
		lineChar[0] = 0x01;
		sprintf(&lineChar[1], " Line %02d", line);
		ssd1306_scroll_text(&dev, lineChar, strlen(lineChar), false);
		vTaskDelay(500 / portTICK_PERIOD_MS);
	}
	vTaskDelay(3000 / portTICK_PERIOD_MS);

	// Scroll Down
	ssd1306_clear_screen(&dev, false);
	ssd1306_contrast(&dev, 0xff);
	ssd1306_display_text(&dev, 0, "--Scroll  DOWN--", 16, true);
	//ssd1306_software_scroll(&dev, 1, 7);
	ssd1306_software_scroll(&dev, 1, (dev._pages - 1));
	for (int line = 0; line <span bottom + 10; line++)
	{
		lineChar[0] = 0x02;
		sprintf(&lineChar[1], " Line %02d", line);
		ssd1306_scroll_text(&dev, lineChar, strlen(lineChar), false);
		vTaskDelay(500 / portTICK_PERIOD_MS);
	}
	vTaskDelay(3000 / portTICK_PERIOD_MS);

	// Page Down
	ssd1306_clear_screen(&dev, false);
	ssd1306_contrast(&dev, 0xff);
	ssd1306_display_text(&dev, 0, "---Page	DOWN---", 16, true);
	ssd1306_software_scroll(&dev, 1, (dev._pages - 1));
	for (int line = 0; line <span bottom + 10; line++)
	{
		//if ( (line % 7) == 0) ssd1306_scroll_clear(&dev);
		if ((line % (dev._pages - 1)) == 0)
			ssd1306_scroll_clear(&dev);
		lineChar[0] = 0x02;
		sprintf(&lineChar[1], " Line %02d", line);
		ssd1306_scroll_text(&dev, lineChar, strlen(lineChar), false);
		vTaskDelay(500 / portTICK_PERIOD_MS);
	}
	vTaskDelay(3000 / portTICK_PERIOD_MS);

	// Horizontal Scroll
	ssd1306_clear_screen(&dev, false);
	ssd1306_contrast(&dev, 0xff);
	ssd1306_display_text(&dev, center, "Horizontal", 10, false);
	ssd1306_hardware_scroll(&dev, SCROLL_RIGHT);
	vTaskDelay(5000 / portTICK_PERIOD_MS);
	ssd1306_hardware_scroll(&dev, SCROLL_LEFT);
	vTaskDelay(5000 / portTICK_PERIOD_MS);
	ssd1306_hardware_scroll(&dev, SCROLL_STOP);

	// Vertical Scroll
	ssd1306_clear_screen(&dev, false);
	ssd1306_contrast(&dev, 0xff);
	ssd1306_display_text(&dev, center, "Vertical", 8, false);
	ssd1306_hardware_scroll(&dev, SCROLL_DOWN);
	vTaskDelay(5000 / portTICK_PERIOD_MS);
	ssd1306_hardware_scroll(&dev, SCROLL_UP);
	vTaskDelay(5000 / portTICK_PERIOD_MS);
	ssd1306_hardware_scroll(&dev, SCROLL_STOP);

	// Invert
	ssd1306_clear_screen(&dev, true);
	ssd1306_contrast(&dev, 0xff);
	ssd1306_display_text(&dev, center, "  Good Bye!!", 12, true);
	vTaskDelay(5000 / portTICK_PERIOD_MS);

	// Fade Out
	ssd1306_fadeout(&dev); */

#if 0
	// Fade Out
	for(int contrast=0xff;contrast>0;contrast=contrast-0x20) {
		ssd1306_contrast(&dev, contrast);
		vTaskDelay(40);
	}
#endif
	xTaskCreate(&get_info_from_aida64, "get_info_from_aida64", 32768, NULL, 5, NULL);
	xTaskCreate(&read_buffer_task, "read_buffer_task", 32768, NULL, 5, NULL);
	while (true)
	{
		vTaskDelay(1);
	}
	esp_restart();
}

void read_buffer_task()
{

	vTaskDelay(4100 / portTICK_PERIOD_MS);
	// 清屏
	ssd1306_clear_screen(&dev, false);
	while (true)
	{
		vTaskDelay(1000 / portTICK_PERIOD_MS);
		ESP_LOGI(TAG, "当前缓冲区数据:%s", response);
		char *line1 = (char *)malloc(16 * sizeof(char));
		char *line2 = (char *)malloc(16 * sizeof(char));
		char *line3 = (char *)malloc(16 * sizeof(char));
		strcpy(line1, "");
		strcpy(line2, "");
		strcpy(line3, "");

		//TODO 不支持懒惰匹配
		char *time = pick_regex(response, "--time-- (.{3,6})\\{\\|}");
		if (time == NULL)
		{
			// 匹配失败，则放弃匹配，等待下次数据传输
			continue;
		}

		strcat(line1, time);
		strcat(line1, " ");
		ESP_LOGI(TAG, "拼接情况：%s,长度:%d", line1, strlen(line1));
		ssd1306_clear_line(&dev, 0, false);
		ssd1306_display_text(&dev, 0, line1, strlen(line1), false);

		char *cpu_usage = pick_regex(response, "--cpu_usage-- (.{2,4})\\{\\|}");
		char *cpu_temp = pick_regex(response, "--cpu_package_temp-- (.{2,6})\\{\\|}");
		strcat(line2, "CPU:");
		strcat(line2, cpu_usage);
		strcat(line2, " ");
		strcat(line2, cpu_temp);

		ESP_LOGI(TAG, "拼接情况：%s,长度:%d", line2, strlen(line2));
		ssd1306_clear_line(&dev, 1, false);
		ssd1306_display_text(&dev, 1, line2, strlen(line2), false);

		char *gpu_usage = pick_regex(response, "--gpu_usage-- (.{2,4})\\{\\|}");
		char *gpu_temp = pick_regex(response, "--gpu_temp-- (.{2,6})\\{\\|}");
		strcat(line3, "GPU:");
		strcat(line3, gpu_usage);
		strcat(line3, " ");
		strcat(line3, gpu_temp);

		ESP_LOGI(TAG, "拼接情况：%s,长度:%d", line3, strlen(line3));
		ssd1306_clear_line(&dev, 2, false);
		ssd1306_display_text(&dev, 2, line3, strlen(line3), false);

		free(line1);
		free(line2);
		free(line3);
		free(time);
		free(cpu_usage);
		free(cpu_temp);
		free(gpu_usage);
		free(gpu_temp);
	}
}

void get_info_from_aida64()
{

	static char *url = CONFIG_AIDA64_REMOTE_SSE_URL;

	while (true)
	{
		vTaskDelay(100 / portTICK_PERIOD_MS);
		http_sse_with_url(url, response);
		// 自动重连
		vTaskDelay(3000 / portTICK_PERIOD_MS);
	}
}

char *pick_regex(const char *string, const char *pattern)
{
	int err;
	char errbuf[1024];
	regex_t compiled;
	if ((err = regcomp(&compiled, pattern, REG_EXTENDED | REG_ICASE)) != 0)
	{
		regerror(err, &compiled, errbuf, sizeof(errbuf));
		ESP_LOGW(TAG, "err:%s\n", errbuf);
		return NULL;
	}
	regmatch_t pmatch[2];
	err = regexec(&compiled, string, 2, pmatch, REG_NOTBOL);
	if (err != 0)
	{
		ESP_LOGW(TAG, "未匹配成功\n");
		return NULL;
	}
	if (compiled.re_nsub != 1 && pmatch[1].rm_so == -1)
	{
		ESP_LOGW(TAG, "匹配成功，但是捕获失败!\n");
		return NULL;
	}
	int len = pmatch[1].rm_eo - pmatch[1].rm_so;
	char *value = (char *)malloc(len + 1);
	if (value == NULL)
		return NULL;
	memset(value, 0, len + 1);
	memcpy(value, string + pmatch[1].rm_so, len);
	ESP_LOGI(TAG, "匹配并且捕获成功,捕获字符串:%s", value);
	//free(value);
	regfree(&compiled); //切记最后要释放掉，否则会造成内存泄露

	return value;
}